import ast

import numpy as np


def reference_forward(X, params):
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    P = 1 / (1 + np.exp(-(H @ params["W2"] + params["b2"])))
    return P, {"Z1": Z1, "H": H, "P": P}


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


def run_forward(m, X, params, what):
    result = m.forward(X, params)
    if not isinstance(result, tuple) or len(result) != 2:
        raise CheckFailed(f"{what}: forward should return two things, the answers and the cache.", actual=repr(type(result).__name__))
    return result


def random_net(seed, readings, hidden, answers):
    rng = np.random.default_rng(seed)
    return {"W1": rng.normal(0, 1, (readings, hidden)), "b1": rng.normal(0, 0.5, hidden),
            "W2": rng.normal(0, 1, (hidden, answers)), "b2": rng.normal(0, 0.5, answers)}


def activations(ctx):
    m = load(ctx)
    close("relu of -2, 0 and 3.5", m.relu(np.array([-2.0, 0.0, 3.5])), [0.0, 0.0, 3.5])
    close("sigmoid of 0, 2 and -2", m.sigmoid(np.array([0.0, 2.0, -2.0])), [0.5, 0.880797, 0.119203])


def by_hand(ctx):
    m = load(ctx)
    X = np.array([[1.0, 2.0], [0.0, 1.0]])
    params = {"W1": np.array([[1.0, -1.0], [0.5, 1.0]]), "b1": np.array([0.0, -2.5]),
              "W2": np.array([[0.5], [3.0]]), "b2": np.array([-1.0])}
    P, _ = run_forward(m, X, params, "Two evenings through a 2-2-1 network")
    close("Two evenings through a 2-2-1 network", P, [[0.5], [0.320821]])


def saved_weights(ctx):
    m = load(ctx)
    params = getattr(m, "NEILS_WEIGHTS", None)
    if not isinstance(params, dict):
        raise CheckFailed("NEILS_WEIGHTS, the dict of Neil's weights, has gone from network.py.")
    X = np.array([[0.9, 0.2, 0.5, 1.0], [0.2, 0.3, 0.4, 0.0], [0.7, 0.9, 0.9, 1.0],
                  [1.0, 0.1, 0.3, 0.0], [0.5, 0.5, 0.5, 0.5], [0.35, 0.8, 0.6, 1.0]])
    P, _ = run_forward(m, X, params, "Six evenings through Neil's weights")
    close("Six evenings through Neil's weights", P, reference_forward(X, params)[0])


def keeps_cache(ctx):
    m = load(ctx)
    X = np.random.default_rng(3).uniform(0, 1, (5, 4))
    params = random_net(14, 4, 6, 3)
    _, cache = run_forward(m, X, params, "The cache")
    want = reference_forward(X, params)[1]
    if not isinstance(cache, dict):
        raise CheckFailed("The cache should be a dict, keyed Z1, H and P.", actual=repr(type(cache).__name__))
    for name in ("Z1", "H", "P"):
        if name not in cache:
            raise CheckFailed(f"The cache has no {name}.", expected=["Z1", "H", "P"], actual=sorted(cache))
        close(f"cache['{name}']", cache[name], want[name])


def other_sizes(ctx):
    m = load(ctx)
    X = np.random.default_rng(5).uniform(0, 1, (8, 3))
    params = random_net(21, 3, 7, 2)
    P, _ = run_forward(m, X, params, "A 3-7-2 network")
    close("Eight rows through a 3-7-2 network with random weights", P, reference_forward(X, params)[0])


def batch_of_one(ctx):
    m = load(ctx)
    X = np.array([[0.3, 0.6, 0.2, 1.0]])
    params = random_net(8, 4, 5, 3)
    P, _ = run_forward(m, X, params, "One evening")
    close("One evening is a batch of one: shape (1, 3)", P, reference_forward(X, params)[0])


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
                if isinstance(inner, (ast.For, ast.While, ast.comprehension)):
                    raise CheckFailed("forward loops over the evenings. One @ handles every row at once.")
            return
    raise CheckFailed("There is no function called forward.")


def names(ctx):
    m = load(ctx)
    P = np.array([[0.9, 0.2, 0.7], [0.1, 0.1, 0.1], [0.5, 0.51, 0.49]])
    got = m.decisions(P)
    want = [["lights", "shutters"], [], ["beacon"]]
    try:
        got = [list(row) for row in got]
    except TypeError:
        raise CheckFailed("decisions should give back a list with one list of names per row.", expected=want, actual=repr(got))
    if got != want:
        raise CheckFailed("decisions for three rows of answers", expected=want, actual=got)


TESTS = [
    custom("relu and sigmoid on a few numbers", activations, visible=True),
    custom("Two evenings through a 2-2-1 network, by hand", by_hand, visible=True),
    custom("Six evenings through Neil's weights", saved_weights),
    custom("The cache keeps Z1, H and P", keeps_cache,
           hint="Return the answers and a dict: {\"Z1\": Z1, \"H\": H, \"P\": P}. Z1 is before the ReLU, H after it."),
    custom("A network of another size", other_sizes,
           hint="Use the weights in the params that forward is given, not the ones at the top of the file."),
    custom("One evening on its own", batch_of_one),
    custom("relu works on a whole grid", relu_grid,
           hint="np.maximum(0, z) compares 0 with every entry. np.max finds the single biggest entry."),
    custom("sigmoid copes with big sums", big_sums,
           hint="1 / 1 + x is (1 / 1) + x. The whole of 1 + np.exp(-z) goes underneath."),
    custom("forward has no loop", no_loop,
           hint="X @ W1 already gives one row per evening. No for loop needed."),
    custom("decisions names the answers above 0.5", names,
           hint="Above 0.5 means strictly above, and the names come in the order of ANSWERS."),
    output("The program reads Paul's four evenings",
           expect="Evening 1: lights\nEvening 2: lights, beacon\nEvening 3: lights, shutters\nEvening 4: nothing"),
]
