import numpy as np


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def ref_softmax(logits):
    e = np.exp(logits - logits.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


def ref_train(ids, size, dim, rate, steps, seed=0):
    rng = np.random.default_rng(seed)
    E = rng.normal(0, 0.1, (size, dim))
    W = rng.normal(0, 0.1, (dim, size))
    X = np.zeros((len(ids) - 1, size))
    X[np.arange(len(ids) - 1), ids[:-1]] = 1
    targets = np.array(ids[1:])
    rows = np.arange(len(targets))
    losses = []
    for _ in range(steps):
        emb = X @ E
        P = ref_softmax(emb @ W)
        losses.append(float(-np.mean(np.log(P[rows, targets]))))
        d = P.copy()
        d[rows, targets] -= 1
        d /= len(targets)
        dW, dE = emb.T @ d, X.T @ (d @ W.T)
        W -= rate * dW
        E -= rate * dE
    return E, W, losses


def load(ctx):
    m = ctx.module()
    for name in ("one_hot", "softmax", "train", "nearest"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def call_train(m, *args, **kwargs):
    got = m.train(*args, **kwargs)
    if not isinstance(got, tuple) or len(got) != 3:
        raise CheckFailed("train should return (E, W, losses).", actual=repr(got)[:120])
    E, W, losses = got
    return np.asarray(E, dtype=float), np.asarray(W, dtype=float), [float(l) for l in losses]


def one_hots(ctx):
    m = load(ctx)
    got = m.one_hot([2, 0, 2], 4)
    want = np.array([[0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 1, 0]], dtype=float)
    if got is None or np.shape(got) != want.shape or not np.array_equal(np.asarray(got, dtype=float), want):
        raise CheckFailed("one_hot([2, 0, 2], 4): a row per id, with a 1 in that id's column.", expected=want.tolist(), actual=None if got is None else shown(got))


def softmaxes(ctx):
    m = load(ctx)
    logits = np.array([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0], [1000.0, 1000.0, 0.0]])
    got = m.softmax(logits.copy())
    want = ref_softmax(logits)
    if got is None or np.shape(got) != want.shape or not np.allclose(np.asarray(got, dtype=float), want):
        raise CheckFailed("softmax, row by row, including a row of very large scores.", expected=shown(want), actual=None if got is None else shown(got))


def falls(ctx):
    m = load(ctx)
    ids = list(np.random.default_rng(3).integers(0, 6, 200))
    E, W, losses = call_train(m, ids, 6, 4, 1.0, 40)
    if len(losses) != 40 or not losses[-1] < losses[0]:
        raise CheckFailed("Forty steps should give forty losses, the last below the first.", actual=f"{len(losses)} losses, from {shown(losses[0]) if losses else None} to {shown(losses[-1]) if losses else None}")


def matches(ctx):
    m = load(ctx)
    ids = [0, 2, 1, 2, 0, 1, 1, 2, 0, 0, 2, 1]
    E, W, losses = call_train(m, ids, 3, 2, 0.5, 5, seed=7)
    want_E, want_W, want_losses = ref_train(ids, 3, 2, 0.5, 5, seed=7)
    if not np.allclose(losses, want_losses, atol=1e-9):
        raise CheckFailed("Five steps on a three-character text: the losses, each measured before its step.", expected=shown(want_losses), actual=shown(losses))
    if E.shape != want_E.shape or not np.allclose(E, want_E, atol=1e-9):
        raise CheckFailed("After five steps, E.", expected=shown(want_E), actual=shown(E))
    if W.shape != want_W.shape or not np.allclose(W, want_W, atol=1e-9):
        raise CheckFailed("After five steps, W.", expected=shown(want_W), actual=shown(W))


def first_loss(ctx):
    m = load(ctx)
    ids = list(np.random.default_rng(5).integers(0, 10, 300))
    E, W, losses = call_train(m, ids, 10, 4, 1.0, 1, seed=1)
    want = ref_train(ids, 10, 4, 1.0, 1, seed=1)[2][0]
    if not losses or abs(losses[0] - want) > 1e-9:
        raise CheckFailed("Before any learning, the loss is about the log of the number of characters.", expected=round(want, 4), actual=shown(losses[0]) if losses else None)


def on_forecasts(ctx):
    m = load(ctx)
    ids, vocab = m.load_forecasts()
    E, W, losses = call_train(m, ids, len(vocab), 8, 4.0, 100)
    if E.shape != (39, 8) or W.shape != (8, 39):
        raise CheckFailed("E is (characters, dim) and W is (dim, characters).", expected="(39, 8) and (8, 39)", actual=f"{E.shape} and {W.shape}")
    if not losses[-1] < 2.1:
        raise CheckFailed("A hundred steps on the forecasts should bring the loss from 3.65 to below 2.1.", actual=shown(losses[-1]))


def neighbours(ctx):
    m = load(ctx)
    E = np.array([[1.0, 0.0], [0.9, 0.1], [0.0, 1.0], [-1.0, 0.0], [10.0, 1.5]])
    vocab = ["a", "e", "z", "!", "o"]
    got = m.nearest(E, vocab, "a", 2)
    if got is None or list(got) != ["e", "o"]:
        raise CheckFailed("The nearest are the ones pointing the same way, however long they are.", expected=["e", "o"], actual=repr(got))


TESTS = [
    custom("One-hot rows", one_hots, visible=True),
    custom("Softmax, row by row", softmaxes, visible=True,
           hint="Subtract each row's largest score before np.exp, or 1000 overflows."),
    custom("The loss falls", falls),
    custom("Five steps, every number", matches,
           hint="The gradient of the loss for the scores is the chances minus the one-hot answers, divided by the number of pairs."),
    custom("The first loss", first_loss),
    custom("On the forecasts", on_forecasts),
    custom("Nearest by direction", neighbours,
           hint="Divide each embedding by its length first, then compare with @."),
]
