import json

import numpy as np


def ref_softmax(scores):
    exps = np.exp(scores - scores.max(axis=-1, keepdims=True))
    return exps / exps.sum(axis=-1, keepdims=True)


def ref_self_attention(X, Wq, Wk, Wv, causal=True):
    Q, K, V = X @ Wq, X @ Wk, X @ Wv
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    if causal:
        scores = np.where(np.triu(np.ones((len(X), len(X)), dtype=bool), k=1), -np.inf, scores)
    return ref_softmax(scores) @ V


def ref_multi_head(X, heads, Wo, causal=True):
    return np.concatenate([ref_self_attention(X, *head, causal) for head in heads], axis=1) @ Wo


def ref_layer_norm(X, gain, shift, eps=1e-5):
    return gain * (X - X.mean(axis=1, keepdims=True)) / np.sqrt(X.var(axis=1, keepdims=True) + eps) + shift


def ref_feed_forward(X, W1, b1, W2, b2):
    return np.maximum(0, X @ W1 + b1) @ W2 + b2


def ref_block(X, p):
    X = X + ref_multi_head(ref_layer_norm(X, p["ln1_gain"], p["ln1_shift"]), p["heads"], p["Wo"])
    return X + ref_feed_forward(ref_layer_norm(X, p["ln2_gain"], p["ln2_shift"]), p["W1"], p["b1"], p["W2"], p["b2"])


def her_weights():
    with open("block_weights.json") as f:
        raw = json.load(f)
    params = {name: np.array(value) for name, value in raw.items() if name not in ("heads", "vocab")}
    params["heads"] = [tuple(np.array(head[name]) for name in ("Wq", "Wk", "Wv")) for head in raw["heads"]]
    return params, raw["vocab"]


def embed(params, vocab, text):
    return params["E"][[vocab.index(char) for char in text]] + params["P"][:len(text)]


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 3)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def load(ctx):
    m = ctx.module()
    for name in ("multi_head", "layer_norm", "feed_forward", "transformer_block"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def close(what, got, want, tol=1e-9):
    if got is None:
        raise CheckFailed(f"{what}: the function gave back None.")
    got = np.asarray(got, dtype=float)
    if got.shape != np.shape(want):
        raise CheckFailed(f"{what}: the shape.", expected=str(np.shape(want)), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        raise CheckFailed(what, expected=shown(want), actual=shown(got))


def rows_normed(ctx):
    m = load(ctx)
    X = np.array([[1.0, 2.0, 3.0, 4.0], [10.0, 10.0, 10.0, 50.0]])
    gain, shift = np.ones(4), np.zeros(4)
    close("layer_norm on two rows, gain 1 and shift 0: each row to mean 0, spread 1", m.layer_norm(X.copy(), gain, shift), ref_layer_norm(X, gain, shift))


def her_block(ctx):
    m = load(ctx)
    params, vocab = her_weights()
    X = embed(params, vocab, "the hill.")
    close("The block on \"the hill.\"", m.transformer_block(X.copy(), params), ref_block(X, params))


def gain_shift(ctx):
    m = load(ctx)
    X = np.random.default_rng(2).normal(3, 2, (5, 6))
    gain, shift = np.linspace(0.5, 1.5, 6), np.linspace(-1, 1, 6)
    close("layer_norm with a gain and a shift", m.layer_norm(X.copy(), gain, shift), ref_layer_norm(X, gain, shift))


def heads(ctx):
    m = load(ctx)
    rng = np.random.default_rng(4)
    X = rng.normal(size=(5, 6))
    hs = [tuple(rng.normal(size=(6, 2)) for _ in range(3)) for _ in range(3)]
    Wo = rng.normal(size=(6, 6))
    close("Three heads of size 2, side by side, then through Wo", m.multi_head(X, hs, Wo), ref_multi_head(X, hs, Wo))
    close("The same heads with causal=False", m.multi_head(X, hs, Wo, causal=False), ref_multi_head(X, hs, Wo, causal=False))


def thinks(ctx):
    m = load(ctx)
    rng = np.random.default_rng(6)
    X = rng.normal(size=(4, 3))
    W1, b1, W2, b2 = rng.normal(size=(3, 5)), rng.normal(size=5), rng.normal(size=(5, 3)), rng.normal(size=3)
    close("The feed-forward network, row by row", m.feed_forward(X, W1, b1, W2, b2), ref_feed_forward(X, W1, b1, W2, b2))


def way_round(ctx):
    m = load(ctx)
    params, vocab = her_weights()
    quiet = dict(params)
    quiet["Wo"] = np.zeros_like(params["Wo"])
    quiet["W2"] = np.zeros_like(params["W2"])
    quiet["b2"] = np.zeros_like(params["b2"])
    X = embed(params, vocab, "fog")
    close("With Wo, W2 and b2 all zero, what comes in goes straight out", m.transformer_block(X.copy(), quiet), X)


def other_text(ctx):
    m = load(ctx)
    params, vocab = her_weights()
    X = embed(params, vocab, "gale. rough sea")
    close("The block on fifteen characters", m.transformer_block(X.copy(), params), ref_block(X, params))


def no_peeking(ctx):
    m = load(ctx)
    params, vocab = her_weights()
    first = np.asarray(m.transformer_block(embed(params, vocab, "the hill."), params), dtype=float)
    second = np.asarray(m.transformer_block(embed(params, vocab, "the hilly"), params), dtype=float)
    if not np.allclose(first[:-1], second[:-1]):
        raise CheckFailed("Changing the last character should change only the last row of the block's output.")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    for want in ("In: (9, 8)  Out: (9, 8)", "changes only the last row: True"):
        if want not in r.output:
            raise CheckFailed(f"The output should include {want!r}.", expected=want, actual=r.output)


TESTS = [
    custom("Layer norm works along each row", rows_normed, visible=True,
           hint="Layer norm is batch norm turned round: the mean and variance of each row, axis=1, keepdims=True."),
    custom("The block on \"the hill.\"", her_block, visible=True),
    custom("Layer norm with a gain and a shift", gain_shift),
    custom("Several heads side by side", heads,
           hint="np.concatenate(outputs, axis=1) puts the heads' outputs side by side: (n, 2) three times makes (n, 6)."),
    custom("The feed-forward network", thinks),
    custom("The way round", way_round,
           hint="Each half adds its result to what came in: X = X + ..., twice."),
    custom("A longer text", other_text),
    custom("Still no looking ahead", no_peeking),
    custom("The program", program),
]
