import ast

import numpy as np

KEYS = ("W1", "b1", "W2", "b2")


def load(ctx):
    m = ctx.module()
    for name in ("one_hot", "softmax", "cross_entropy", "forward", "backward", "accuracy", "train"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def ref_softmax(Z):
    e = np.exp(Z - Z.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


def ref_forward(X, p):
    Z1 = X @ p["W1"] + p["b1"]
    H = np.maximum(0, Z1)
    P = ref_softmax(H @ p["W2"] + p["b2"])
    return P, {"Z1": Z1, "H": H, "P": P}


def ref_loss(P, labels):
    return -np.mean(np.log(P[np.arange(len(P)), labels]))


def ref_backward(X, labels, p, c):
    dZ2 = (c["P"] - np.eye(c["P"].shape[1])[labels]) / len(X)
    dZ1 = (dZ2 @ p["W2"].T) * (c["Z1"] > 0)
    return {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": c["H"].T @ dZ2, "b2": dZ2.sum(axis=0)}


def brain(seed, n_in, hidden, classes, n):
    rng = np.random.default_rng(seed)
    X = rng.uniform(0, 1, (n, n_in))
    labels = rng.integers(0, classes, n)
    p = {"W1": rng.normal(0, 1, (n_in, hidden)), "b1": rng.normal(0, 0.5, hidden),
         "W2": rng.normal(0, 1, (hidden, classes)), "b2": rng.normal(0, 0.5, classes)}
    return X, labels, p


def close(what, got, want, tol=1e-7):
    if got is None:
        raise CheckFailed(f"{what}: the function gave back None.")
    got = np.asarray(got, dtype=float)
    want = np.asarray(want, dtype=float)
    if got.shape != want.shape:
        raise CheckFailed(f"{what}: the shape.", expected=str(want.shape), actual=str(got.shape))
    if not np.all(np.isfinite(got)) or not np.allclose(got, want, atol=tol, rtol=1e-6):
        raise CheckFailed(what, expected=np.round(want, 4).tolist(), actual=np.round(got, 4).tolist())


def softmax_known(ctx):
    m = load(ctx)
    Z = np.array([[2.0, 1.0, 0.0], [0.0, 3.0, 1.0]])
    close("softmax of two rows of three scores", m.softmax(Z), ref_softmax(Z))


def cross_entropy_known(ctx):
    m = load(ctx)
    P = np.array([[0.5, 0.25, 0.25], [0.1, 0.1, 0.8]])
    got = m.cross_entropy(P, np.array([0, 1]))
    want = -(np.log(0.5) + np.log(0.1)) / 2
    if got is None or not np.isclose(float(got), want):
        raise CheckFailed("Chances of 0.5 and 0.1 on the right answers.", expected=round(want, 4), actual=None if got is None else round(float(got), 4))


def one_hot(ctx):
    m = load(ctx)
    close("one_hot([2, 0, 9], 10)", m.one_hot(np.array([2, 0, 9]), 10), np.eye(10)[[2, 0, 9]])
    close("one_hot([1, 1], 3)", m.one_hot(np.array([1, 1]), 3), [[0, 1, 0], [0, 1, 0]])


def softmax_hard(ctx):
    m = load(ctx)
    close("softmax of scores in the thousands", m.softmax(np.array([[1000.0, 1001.0, 998.0]])), ref_softmax(np.array([[1000.0, 1001.0, 998.0]])))
    Z = np.array([[1000.0, 1001.0], [0.0, 1.0]])
    close("softmax of a row of big scores and a row of small", m.softmax(Z), ref_softmax(Z))


def knows_nothing(ctx):
    m = load(ctx)
    got = m.cross_entropy(np.full((4, 10), 0.1), np.array([3, 1, 4, 1]))
    if got is None or not np.isclose(float(got), np.log(10)):
        raise CheckFailed("A tenth on every answer costs minus the log of a tenth.", expected=round(np.log(10), 4), actual=got)


def forward(ctx):
    m = load(ctx)
    X, labels, p = brain(4, 6, 5, 4, 7)
    out = m.forward(X, p)
    if not isinstance(out, tuple) or len(out) != 2:
        raise CheckFailed("forward should give back two things: the chances and the cache.", actual=repr(type(out)))
    close("Seven rows through a 6-5-4 brain", out[0], ref_forward(X, p)[0])


def gradients(ctx):
    m = load(ctx)
    X, labels, p = brain(7, 5, 4, 3, 6)
    P, cache = ref_forward(X, p)
    grads = m.backward(X, labels, p, cache)
    if not isinstance(grads, dict):
        raise CheckFailed("backward should give back a dict of gradients, keyed like params.", actual=repr(type(grads)))
    for name in KEYS:
        array = p[name]
        measured = np.zeros_like(array)
        for index in np.ndindex(array.shape):
            original = array[index]
            array[index] = original + 1e-5
            up = ref_loss(ref_forward(X, p)[0], labels)
            array[index] = original - 1e-5
            down = ref_loss(ref_forward(X, p)[0], labels)
            array[index] = original
            measured[index] = (up - down) / 2e-5
        if name not in grads:
            raise CheckFailed(f"The gradients have no {name}.", actual=sorted(grads))
        close(f"The gradient for {name}, against the measured one", grads[name], measured, tol=1e-6)


def one_row(ctx):
    m = load(ctx)
    X, labels, p = brain(9, 4, 3, 10, 1)
    P, cache = ref_forward(X, p)
    grads = m.backward(X, labels, p, cache)
    want = ref_backward(X, labels, p, cache)
    for name in KEYS:
        close(f"One digit on its own: the gradient for {name}", grads[name], want[name])


def no_loop(ctx):
    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name in ("backward", "softmax"):
            for inner in ast.walk(node):
                if isinstance(inner, (ast.For, ast.While, ast.comprehension)):
                    raise CheckFailed(f"{node.name} loops. Whole-array operations handle every row at once.")


def accuracy(ctx):
    m = load(ctx)
    P = np.array([[0.1, 0.7, 0.2], [0.5, 0.3, 0.2], [0.2, 0.2, 0.6], [0.3, 0.4, 0.3]])
    got = m.accuracy(P, np.array([1, 2, 2, 1]))
    if got is None or not np.isclose(float(got), 0.75):
        raise CheckFailed("Three of four rows have their biggest chance on the right answer.", expected=0.75, actual=got)


class Counting:
    def __init__(self):
        self.steps = 0

    def step(self, params, grads):
        self.steps += 1


def counts(ctx):
    m = load(ctx)
    X, labels, p = brain(2, 4, 3, 5, 10)
    counter = Counting()
    losses = m.train(X, labels, p, counter, 2, 4, np.random.default_rng(0))
    if counter.steps != 6:
        raise CheckFailed("Ten rows in batches of 4 is three steps an epoch: six in two epochs.", expected=6, actual=counter.steps)
    if losses is None or len(losses) != 2:
        raise CheckFailed("Two epochs should give back two losses.", actual=repr(losses))


class Plain:
    def step(self, params, grads):
        for name in params:
            params[name] -= 0.5 * grads[name]


def every_number(ctx):
    m = load(ctx)
    X, labels, p = brain(5, 4, 3, 3, 9)
    start = {k: v.copy() for k, v in p.items()}
    losses = m.train(X, labels, p, Plain(), 2, 4, np.random.default_rng(6))
    want, want_losses = {k: v.copy() for k, v in start.items()}, []
    rng = np.random.default_rng(6)
    for _ in range(2):
        order = rng.permutation(9)
        for s in range(0, 9, 4):
            rows = order[s:s + 4]
            P, c = ref_forward(X[rows], want)
            g = ref_backward(X[rows], labels[rows], want, c)
            for k in want:
                want[k] = want[k] - 0.5 * g[k]
        want_losses.append(ref_loss(ref_forward(X, want)[0], labels))
    close("Two epochs: the cross-entropy on every row after each", [float(x) for x in (losses or [])], want_losses)
    for k in KEYS:
        close(f"Two epochs: params['{k}'] at the end", p[k], want[k])


def reads(ctx):
    m = load(ctx)
    from notebooks import load_notebook_digits
    from training import Adam, init_params
    images, labels = load_notebook_digits()
    X = images.reshape(len(images), 64) / 16
    order = np.random.default_rng(10).permutation(len(X))
    learn, held_back = order[:1500], order[1500:]
    params = init_params(64, 32, 10, np.random.default_rng(11))
    m.train(X[learn], labels[learn], params, Adam(0.01), 10, 32, np.random.default_rng(12))
    P, _ = ref_forward(X[held_back], params)
    got = float(np.mean(P.argmax(axis=1) == labels[held_back]))
    if got < 0.95:
        raise CheckFailed("After ten epochs, it should read at least 95% of the digits it was never shown.", expected="at least 95%", actual=f"{got:.1%}")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    want = ["Loss: 0.543 after the first epoch, 0.029 after the last",
            "Read 293 of 297 digits it had never seen",
            "Misread: 4 as 7, 9 as 5, 9 as 8, 8 as 1"]
    if r.lines()[-3:] != want:
        raise CheckFailed("The program learns her digits, then reads the ones it was never shown.", expected="\n".join(want), actual=r.output)


TESTS = [
    custom("softmax: two rows of known chances", softmax_known, visible=True),
    custom("cross_entropy: two rows", cross_entropy_known, visible=True),
    custom("one_hot", one_hot),
    custom("softmax copes with big scores, row by row", softmax_hard,
           hint="Shift each row by its own biggest score, kept as a column: Z.max(axis=1, keepdims=True)."),
    custom("Knowing nothing costs 2.303", knows_nothing),
    custom("forward: chances for every row", forward),
    custom("backward agrees with the measured gradients", gradients,
           hint="The blame at the scores is (P - one_hot(labels, P.shape[1])) / len(X). From there it's Neural Network from Scratch."),
    custom("backward for one digit on its own", one_row),
    custom("softmax and backward have no loops", no_loop),
    custom("accuracy", accuracy,
           hint="argmax(axis=1) gives each row's biggest column."),
    custom("train takes one step per batch", counts),
    custom("train: two epochs, every number", every_number,
           hint="Call batches(X, labels, batch_size, rng) once per epoch, and note the cross-entropy on all of X after the epoch's last step."),
    custom("It reads digits it has never seen", reads, timeout=60),
    custom("The program reads her digits", program, timeout=60),
]
