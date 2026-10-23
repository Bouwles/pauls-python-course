import ast

import numpy as np


def reference_forward(X, W1, b1, W2, b2):
    hidden = np.maximum(0, X @ W1 + b1)
    return 1 / (1 + np.exp(-(hidden @ W2 + b2)))


def load(ctx):
    m = ctx.module()
    for name in ("relu", "sigmoid", "forward", "decisions"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def close(what, got, want, tol=1e-6):
    if got is None:
        raise CheckFailed(f"{what}: the function gave back None. Did it return its answer?")
    got = np.asarray(got, dtype=float)
    want = np.asarray(want, dtype=float)
    if got.shape != want.shape:
        raise CheckFailed(f"{what}: the shape.", expected=str(want.shape), actual=str(got.shape))
    if not np.allclose(got, want, atol=tol):
        raise CheckFailed(what, expected=np.round(want, 4).tolist(), actual=np.round(got, 4).tolist())


def random_brain(seed, readings, hidden, answers):
    rng = np.random.default_rng(seed)
    return (rng.normal(0, 1, (readings, hidden)), rng.normal(0, 0.5, hidden),
            rng.normal(0, 1, (hidden, answers)), rng.normal(0, 0.5, answers))


def activations(ctx):
    m = load(ctx)
    close("relu of -2, 0 and 3.5", m.relu(np.array([-2.0, 0.0, 3.5])), [0.0, 0.0, 3.5])
    close("sigmoid of 0, 2 and -2", m.sigmoid(np.array([0.0, 2.0, -2.0])), [0.5, 0.880797, 0.119203])


def by_hand(ctx):
    m = load(ctx)
    evenings = np.array([[1.0, 2.0], [0.0, 1.0]])
    W1 = np.array([[1.0, -1.0], [0.5, 1.0]])
    b1 = np.array([0.0, -2.5])
    W2 = np.array([[0.5], [3.0]])
    b2 = np.array([-1.0])
    close("Two evenings through a 2-2-1 brain", m.forward(evenings, W1, b1, W2, b2), [[0.5], [0.320821]])


def her_weights(ctx):
    m = load(ctx)
    evenings = np.array([[0.9, 0.2, 0.5, 1.0], [0.2, 0.3, 0.4, 0.0], [0.7, 0.9, 0.9, 1.0],
                         [1.0, 0.1, 0.3, 0.0], [0.5, 0.5, 0.5, 0.5], [0.35, 0.8, 0.6, 1.0]])
    weights = (m.W1, m.b1, m.W2, m.b2)
    close("Six evenings through Penhallow's weights", m.forward(evenings, *weights), reference_forward(evenings, *weights))


def other_sizes(ctx):
    m = load(ctx)
    X = np.random.default_rng(5).uniform(0, 1, (8, 3))
    brain = random_brain(21, 3, 7, 2)
    close("Eight rows through a 3-7-2 brain with random weights", m.forward(X, *brain), reference_forward(X, *brain))


def batch_of_one(ctx):
    m = load(ctx)
    X = np.array([[0.3, 0.6, 0.2, 1.0]])
    brain = random_brain(8, 4, 5, 3)
    close("One evening is a batch of one: shape (1, 3)", m.forward(X, *brain), reference_forward(X, *brain))


def relu_grid(ctx):
    m = load(ctx)
    close("relu of a 2 by 2 array", m.relu(np.array([[-1.5, 2.0], [0.3, -0.2]])), [[0.0, 2.0], [0.3, 0.0]])


def big_sums(ctx):
    m = load(ctx)
    close("sigmoid of -30 and 30", m.sigmoid(np.array([-30.0, 30.0])), [0.0, 1.0])


def no_loop(ctx):
    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name == "forward":
            for inner in ast.walk(node):
                if isinstance(inner, (ast.For, ast.While, ast.ListComp, ast.GeneratorExp, ast.comprehension)):
                    raise CheckFailed("forward loops over the evenings. One @ handles every row at once.")
            return
    raise CheckFailed("There is no function called forward.")


def names(ctx):
    m = load(ctx)
    outputs = np.array([[0.9, 0.2, 0.7], [0.1, 0.1, 0.1], [0.5, 0.51, 0.49]])
    got = m.decisions(outputs)
    want = [["lamp", "gate"], [], ["horn"]]
    try:
        got = [list(row) for row in got]
    except TypeError:
        raise CheckFailed("decisions should give back a list with one list of names per row.", expected=want, actual=repr(got))
    if got != want:
        raise CheckFailed("decisions for three rows of outputs", expected=want, actual=got)


TESTS = [
    custom("relu and sigmoid on a few numbers", activations, visible=True),
    custom("Two evenings through a 2-2-1 brain, by hand", by_hand, visible=True),
    custom("Six evenings through Penhallow's weights", her_weights),
    custom("A brain of another size", other_sizes,
           hint="Use the W1, b1, W2 and b2 that forward is given, not the ones at the top of the file."),
    custom("One evening on its own", batch_of_one),
    custom("relu works on a whole grid", relu_grid,
           hint="np.maximum(0, z) compares 0 with every entry. np.max finds the single biggest entry."),
    custom("sigmoid copes with big sums", big_sums),
    custom("forward has no loop", no_loop,
           hint="evenings @ W1 already gives one row per evening. No for loop needed."),
    custom("decisions names the answers above 0.5", names,
           hint="Above 0.5 means strictly above, and the names come in the order of ANSWERS."),
    output("The program reads Penhallow's four evenings",
           expect="Evening 1: lamp\nEvening 2: lamp, horn\nEvening 3: lamp, gate\nEvening 4: nothing"),
]
