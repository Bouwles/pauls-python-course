import json

import numpy as np

KEYS = ("E", "W1", "b1", "W2", "b2")


def ref_forward(X, p):
    flat = p["E"][X].reshape(len(X), -1)
    H = np.tanh(flat @ p["W1"] + p["b1"])
    S = H @ p["W2"] + p["b2"]
    e = np.exp(S - S.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


def ref_loss(X, y, p):
    P = ref_forward(X, p)
    return float(-np.mean(np.log(P[np.arange(len(y)), y])))


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def tiny(seed=3):
    rng = np.random.default_rng(seed)
    p = {"E": rng.normal(0, 1, (5, 3)), "W1": rng.normal(0, 0.5, (6, 4)), "b1": rng.normal(0, 0.1, 4),
         "W2": rng.normal(0, 0.5, (4, 5)), "b2": rng.normal(0, 0.1, 5)}
    X = np.array([[0, 1], [1, 1], [4, 2], [3, 3], [2, 0], [1, 4]])
    y = np.array([2, 0, 1, 3, 4, 4])
    return X, y, p


def measured(X, y, p):
    out = {}
    for name in KEYS:
        array = p[name]
        grad = np.zeros_like(array)
        for index in np.ndindex(array.shape):
            original = array[index]
            array[index] = original + 1e-5
            up = ref_loss(X, y, p)
            array[index] = original - 1e-5
            down = ref_loss(X, y, p)
            array[index] = original
            grad[index] = (up - down) / 2e-5
        out[name] = grad
    return out


def load(ctx):
    m = ctx.module()
    for name in ("init_model", "forward", "loss", "backward", "train", "model_chances"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def notes_data(m, context=4):
    notes = m.load_notes()
    learn, held = m.split_notes(notes)
    vocab = m.build_vocab(notes)
    return vocab, m.windows(learn, vocab, context), m.windows(held, vocab, context)


def call_forward(m, X, p):
    got = m.forward(X, p)
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("forward should return (P, cache).", actual=repr(got)[:120])
    return np.asarray(got[0], dtype=float), got[1]


def shapes(ctx):
    m = load(ctx)
    p = m.init_model(7, context=3, dim=2, hidden=5, seed=1)
    want = {"E": (7, 2), "W1": (6, 5), "b1": (5,), "W2": (5, 7), "b2": (7,)}
    got = {name: np.shape(p.get(name)) for name in want} if isinstance(p, dict) else None
    if got != want:
        raise CheckFailed("init_model(7, context=3, dim=2, hidden=5): the shapes of the weights.", expected=str(want), actual=str(got))
    X = np.array([[0, 1, 2], [6, 6, 0], [3, 4, 5], [1, 1, 1]])
    P, cache = call_forward(m, X, p)
    if P.shape != (4, 7) or not np.allclose(P.sum(axis=1), 1):
        raise CheckFailed("Four windows give four rows of chances, each adding up to 1.", expected="(4, 7)", actual=f"{P.shape}, sums {shown(P.sum(axis=1))}")
    if not np.allclose(P, ref_forward(X, p)):
        raise CheckFailed("The chances, through the embeddings, the tanh layer and softmax.", expected=shown(ref_forward(X, p)), actual=shown(P))


def gradients(ctx):
    m = load(ctx)
    X, y, p = tiny()
    P, cache = call_forward(m, X, p)
    grads = m.backward(X, y, p, cache)
    if not isinstance(grads, dict):
        raise CheckFailed("backward should return a dict of gradients keyed like params.", actual=repr(grads)[:120])
    want = measured(X, y, {k: v.copy() for k, v in p.items()})
    for name in KEYS:
        if name not in grads or np.shape(grads[name]) != p[name].shape:
            raise CheckFailed(f"The gradient for {name} should have {name}'s shape.", expected=str(p[name].shape), actual=str(np.shape(grads.get(name))))
        if not np.allclose(grads[name], want[name], rtol=1e-4, atol=1e-7):
            raise CheckFailed(f"The gradient for {name} doesn't match the measured one.", expected=shown(want[name]), actual=shown(grads[name]))


def losses(ctx):
    m = load(ctx)
    X, y, p = tiny(5)
    P = ref_forward(X, p)
    got = m.loss(P, y)
    if got is None or abs(float(got) - ref_loss(X, y, p)) > 1e-9:
        raise CheckFailed("loss: the average of minus the log of each real next character's chance.", expected=round(ref_loss(X, y, p), 6), actual=None if got is None else shown(got))


def trained_weights(ctx):
    m = load(ctx)
    vocab, (X, y), (Xh, yh) = notes_data(m)
    with open("trained.json") as f:
        p = {name: np.array(value) for name, value in json.load(f).items()}
    got = np.asarray(m.model_chances(Xh, yh, p), dtype=float)
    P = ref_forward(Xh, p)
    want = P[np.arange(len(yh)), yh]
    if got.shape != want.shape or not np.allclose(got, want):
        raise CheckFailed("With Wendt's trained weights, the chance of each held-back character.", expected=shown(want[:5]), actual=shown(got[:5]))
    ppl = float(np.exp(-np.mean(np.log(got))))
    if not ppl < 9.79:
        raise CheckFailed("Wendt's weights should beat the bigram's 9.80 on the held-back notes.", actual=round(ppl, 2))


def falls(ctx):
    m = load(ctx)
    vocab, (X, y), _ = notes_data(m)
    p = m.init_model(len(vocab))
    got = m.train(X, y, p, 0.3, 200)
    if got is None or len(got) != 200:
        raise CheckFailed("200 steps should give 200 losses.", actual=None if got is None else len(got))
    first, last = float(np.mean(got[:50])), float(np.mean(got[-50:]))
    if not last < first - 0.5:
        raise CheckFailed("Over 200 steps the loss should fall: the last 50 batches well below the first 50.", expected="a fall of more than 0.5", actual=f"{first:.3f} to {last:.3f}")


def in_place(ctx):
    m = load(ctx)
    X, y, p = tiny(7)
    before = {k: v.copy() for k, v in p.items()}
    m.train(X, y, p, 0.5, 3, batch=4, seed=0)
    if all(np.array_equal(p[k], before[k]) for k in KEYS):
        raise CheckFailed("train should change the weights in params, in place.")
    again = {k: v.copy() for k, v in before.items()}
    m.train(X, y, again, 0.5, 3, batch=4, seed=0)
    if not all(np.allclose(p[k], again[k]) for k in KEYS):
        raise CheckFailed("Two runs with the same seed should train exactly alike.")


def one_step(ctx):
    m = load(ctx)
    X, y, p = tiny(9)
    start = {k: v.copy() for k, v in p.items()}
    rows = np.random.default_rng(4).integers(0, len(X), 3)
    want = measured(X[rows], y[rows], {k: v.copy() for k, v in start.items()})
    m.train(X, y, p, 0.5, 1, batch=3, seed=4)
    for name in KEYS:
        if not np.allclose(p[name], start[name] - 0.5 * want[name], atol=1e-6):
            raise CheckFailed(f"One step at rate 0.5: {name} should move by 0.5 times its gradient on the batch.",
                              expected=shown(start[name] - 0.5 * want[name]), actual=shown(p[name]))


TESTS = [
    custom("The weights' shapes, and the chances", shapes, visible=True),
    custom("Every gradient matches the measured one", gradients, visible=True,
           hint="A character that appears twice in a window gets blame from both places: np.add.at adds them, where d_E[X] = ... would keep only one."),
    custom("The loss", losses),
    custom("Wendt's trained weights beat the bigram", trained_weights),
    custom("Training brings the loss down", falls,
           hint="Each step: a batch of rows, forward, note the loss, backward, then subtract rate times each gradient."),
    custom("Training changes params, the same way every time", in_place),
    custom("One step on one batch", one_step,
           hint="Make one rng = np.random.default_rng(seed), and each step take rows = rng.integers(0, len(X), batch)."),
]
