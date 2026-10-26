import json as _json

import numpy as _np

LINES = [
    "the river to day, and the strange of the work the busin't so a morning from before on the",
    "george said, and a not a sing to much as real the partice, and the man who had the sland wa",
    "montmorency would have stopped half a man on the back that it was a since to be in a methin",
]


def _module(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"gpt.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _softmax(x):
    e = _np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)


def _ln(X, g, s):
    return g * (X - X.mean(axis=1, keepdims=True)) / _np.sqrt(X.var(axis=1, keepdims=True) + 1e-5) + s


def _scores(ids, raw):
    X = _np.array(raw["E"])[ids] + _np.array(raw["P"])[:len(ids)]
    n = len(ids)
    mask = _np.triu(_np.ones((n, n), dtype=bool), k=1)
    for b in raw["blocks"]:
        A = _ln(X, _np.array(b["ln1_gain"]), _np.array(b["ln1_shift"]))
        outs = []
        for h in b["heads"]:
            Q, K, V = A @ _np.array(h["Wq"]), A @ _np.array(h["Wk"]), A @ _np.array(h["Wv"])
            S = _np.where(mask, -_np.inf, Q @ K.T / _np.sqrt(K.shape[-1]))
            outs.append(_softmax(S) @ V)
        X = X + _np.concatenate(outs, axis=1) @ _np.array(b["Wo"])
        F = _ln(X, _np.array(b["ln2_gain"]), _np.array(b["ln2_shift"]))
        X = X + _np.maximum(0, F @ _np.array(b["W1"]) + _np.array(b["b1"])) @ _np.array(b["W2"]) + _np.array(b["b2"])
    X = _ln(X, _np.array(raw["lnf_gain"]), _np.array(raw["lnf_shift"]))
    return X[-1] @ _np.array(raw["W_out"]) + _np.array(raw["b_out"])


def _raw():
    with open("gpt_weights.json") as f:
        return _json.load(f)


def _weights(mod):
    result = mod.load_gpt()
    try:
        params, vocab = result
    except (TypeError, ValueError):
        raise CheckFailed("load_gpt is written for you and gives back (params, vocab). Has it been changed?")
    return params, vocab


def embeds(ctx):
    mod = _module(ctx, "load_gpt", "embed")
    params, vocab = _weights(mod)
    raw = _raw()
    got = mod.embed([0, 5, 3], params)
    if got is None:
        raise CheckFailed("embed gave back None. Did it return the rows?")
    got = _np.asarray(got, dtype=float)
    want = _np.array(raw["E"])[[0, 5, 3]] + _np.array(raw["P"])[:3]
    if got.shape != want.shape or not _np.allclose(got, want):
        raise CheckFailed("Three characters: their rows of E, each plus its position's row of P.", expected=str(want.shape), actual=str(got.shape))


def scores_match(ctx):
    mod = _module(ctx, "load_gpt", "next_scores")
    params, vocab = _weights(mod)
    raw = _raw()
    for text in ["the boat", "harris and george went up the river by the"[:32]]:
        ids = [vocab.index(c) for c in text]
        got = mod.next_scores(ids, params)
        if got is None:
            raise CheckFailed("next_scores gave back None. Did it return the scores?")
        got = _np.asarray(got, dtype=float)
        want = _scores(ids, raw)
        if got.shape != want.shape:
            raise CheckFailed("One score for each character in the vocabulary, for the character after the last one.",
                              expected=str(want.shape), actual=str(got.shape))
        if not _np.allclose(got, want, atol=1e-8):
            raise CheckFailed(f"The scores after {text!r} differ from a reference transformer's. Every block in turn, then the final layer norm, then the last row only.",
                              expected=_np.round(want[:5], 3).tolist(), actual=_np.round(got[:5], 3).tolist())


def cold(ctx):
    mod = _module(ctx, "sample_next")
    for seed in range(5):
        got = mod.sample_next(_np.array([1.0, 3.0, 2.0]), 0.01, _np.random.default_rng(seed))
        if got != 1:
            raise CheckFailed("At a temperature near 0, the highest score wins every time.", expected=1, actual=got)


def draws(ctx):
    mod = _module(ctx, "sample_next")
    scores = _np.array([0.5, 1.5, 0.0, 1.0])
    for temperature in [1.0, 2.0]:
        want = [int(_np.random.default_rng(s).choice(4, p=_softmax(scores / temperature))) for s in range(8)]
        got = [mod.sample_next(scores, temperature, _np.random.default_rng(s)) for s in range(8)]
        if [int(g) for g in got] != want:
            raise CheckFailed(f"At a temperature of {temperature}, draw with rng.choice(len(scores), p=softmax(scores / temperature)).",
                              expected=want, actual=got)


def generates(ctx):
    mod = _module(ctx, "load_gpt", "generate")
    params, vocab = _weights(mod)
    got = mod.generate("the dog", params, vocab, 20, 0.5, _np.random.default_rng(1))
    if not isinstance(got, str) or not got.startswith("the dog") or len(got) != 27:
        raise CheckFailed("generate gives back the start, then 20 more characters, as one string.", actual=repr(got))


def long_start(ctx):
    mod = _module(ctx, "load_gpt", "generate")
    params, vocab = _weights(mod)
    raw = _raw()
    start = "we were sitting in my room, smoking, and talking"
    try:
        got = mod.generate(start, params, vocab, 5, 0.5, _np.random.default_rng(2))
    except ValueError as error:
        raise CheckFailed(f"A start longer than the context crashed: {error}. Use only the last CONTEXT characters each time.")
    rng = _np.random.default_rng(2)
    ids = [vocab.index(c) for c in start]
    for _ in range(5):
        s = _scores(ids[-len(raw["P"]):], raw)
        ids.append(int(rng.choice(len(s), p=_softmax(s / 0.5))))
    want = "".join(vocab[i] for i in ids)
    if got != want:
        raise CheckFailed("With a long start, each next character comes from the last 32 characters only.", expected=want, actual=got)


def passages(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    lines = result.lines()
    for want in LINES:
        if want not in lines:
            raise CheckFailed("Three passages, one rng seeded with 308 for all three, 80 characters each at a temperature of 0.5.",
                              expected=want, actual=result.output)


TESTS = [
    custom("embed adds each character's position", embeds, visible=True),
    custom("next_scores matches a reference transformer", scores_match, visible=True),
    custom("Near a temperature of 0, the top score wins", cold,
           hint="If only this fails, divide the scores by the temperature before the softmax."),
    custom("sample_next draws with the seeded rng", draws),
    custom("generate gives the start and then the new characters", generates),
    custom("A start longer than the context", long_start,
           hint="If only this fails, the positions table has 32 rows. Look at no more than the last 32 characters."),
    custom("Writes the three passages", passages),
]
