import ast

import numpy as np

KEYS = ("W1", "b1", "W2", "b2")


def ref_forward(X, params):
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    P = 1 / (1 + np.exp(-(H @ params["W2"] + params["b2"])))
    return P, {"Z1": Z1, "H": H, "P": P}


def ref_loss(P, T):
    return np.mean((P - T) ** 2)


def ref_backward(X, T, params, cache):
    Z1, H, P = cache["Z1"], cache["H"], cache["P"]
    dZ2 = 2 * (P - T) / P.size * P * (1 - P)
    dZ1 = (dZ2 @ params["W2"].T) * (Z1 > 0)
    return {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dZ2, "b2": dZ2.sum(axis=0)}


def measured(X, T, params):
    out = {}
    for name in KEYS:
        array = params[name]
        grad = np.zeros_like(array)
        for index in np.ndindex(array.shape):
            original = array[index]
            array[index] = original + 1e-5
            up = ref_loss(ref_forward(X, params)[0], T)
            array[index] = original - 1e-5
            down = ref_loss(ref_forward(X, params)[0], T)
            array[index] = original
            grad[index] = (up - down) / 2e-5
        out[name] = grad
    return out


def brain(seed, readings, hidden, answers, n):
    rng = np.random.default_rng(seed)
    X = rng.uniform(-1, 1, (n, readings))
    T = (rng.uniform(0, 1, (n, answers)) > 0.5).astype(float)
    params = {
        "W1": rng.normal(0, 1, (readings, hidden)),
        "b1": rng.normal(0, 0.5, hidden),
        "W2": rng.normal(0, 1, (hidden, answers)),
        "b2": rng.normal(0, 0.5, answers),
    }
    return X, T, params


def ferro():
    X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
    T = np.array([[1.0], [0.0], [0.0], [1.0]])
    rng = np.random.default_rng(2)
    params = {"W1": rng.normal(0, 1, (2, 4)), "b1": np.full(4, 0.1),
              "W2": rng.normal(0, 1, (4, 1)), "b2": np.zeros(1)}
    return X, T, params


def copy(params):
    return {name: value.copy() for name, value in params.items()}


def load(ctx):
    m = ctx.module()
    for name in ("backward", "check_gradients", "train"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def learner_grads(m, X, T, params):
    P, cache = ref_forward(X, params)
    grads = m.backward(X, T, params, cache)
    if not isinstance(grads, dict):
        raise CheckFailed("backward should return a dict of gradients, keyed W1, b1, W2, b2.", actual=repr(grads))
    for name in KEYS:
        if name not in grads:
            raise CheckFailed(f"The gradients have no {name}. Use the same keys as params.", actual=sorted(grads))
        shape = np.shape(grads[name])
        if shape != params[name].shape:
            raise CheckFailed(f"The gradient for {name} should be the same shape as {name}.",
                              expected=str(params[name].shape), actual=str(shape))
    return grads


def agrees(m, X, T, params, what):
    grads = learner_grads(m, X, T, params)
    want = measured(X, T, copy(params))
    for name in KEYS:
        if not np.allclose(grads[name], want[name], rtol=1e-4, atol=1e-7):
            raise CheckFailed(f"{what}: the gradient for {name} doesn't match the measured one.",
                              expected=np.round(want[name], 5).tolist(), actual=np.round(np.asarray(grads[name], dtype=float), 5).tolist())


def shapes(ctx):
    m = load(ctx)
    X, T, params = brain(3, 2, 3, 1, 4)
    learner_grads(m, X, T, params)


def small(ctx):
    m = load(ctx)
    X, T, params = brain(3, 2, 3, 1, 4)
    agrees(m, X, T, params, "A 2-3-1 brain, four examples")


def wide(ctx):
    m = load(ctx)
    X, T, params = brain(11, 4, 5, 3, 6)
    agrees(m, X, T, params, "A 4-5-3 brain, six examples")


def asleep(ctx):
    m = load(ctx)
    X, T, params = brain(7, 3, 4, 1, 5)
    params["b1"][1] = -10.0
    agrees(m, X, T, params, "A brain whose second hidden neuron never fires")


def single(ctx):
    m = load(ctx)
    X, T, params = brain(19, 3, 4, 1, 1)
    agrees(m, X, T, params, "One example on its own")


def untouched(ctx):
    m = load(ctx)
    X, T, params = brain(5, 2, 3, 1, 4)
    before = copy(params)
    learner_grads(m, X, T, params)
    for name in KEYS:
        if not np.array_equal(params[name], before[name]):
            raise CheckFailed(f"backward changed params['{name}']. It should only work out gradients.")


def no_loop(ctx):
    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name == "backward":
            for inner in ast.walk(node):
                if isinstance(inner, (ast.For, ast.While, ast.comprehension)):
                    raise CheckFailed("backward loops. Each rule on the board handles every evening at once.")
            return
    raise CheckFailed("There is no function called backward.")


def passes_good(ctx):
    m = load(ctx)
    m.backward = ref_backward
    X, T, params = brain(3, 2, 3, 1, 4)
    got = m.check_gradients(X, T, params)
    if not isinstance(got, dict) or {k: bool(v) for k, v in got.items()} != {k: True for k in KEYS}:
        raise CheckFailed("With a correct backward, every gradient should check out.",
                          expected={k: True for k in KEYS}, actual=repr(got))


def catches_bad(ctx):
    m = load(ctx)

    def wrong_backward(X, T, params, cache):
        grads = ref_backward(X, T, params, cache)
        grads["W1"] = grads["W1"] * 2
        grads["b2"] = -grads["b2"]
        return grads

    m.backward = wrong_backward
    X, T, params = brain(3, 2, 3, 1, 4)
    got = m.check_gradients(X, T, params)
    want = {"W1": False, "b1": True, "W2": True, "b2": False}
    if not isinstance(got, dict) or {k: bool(v) for k, v in got.items()} != want:
        raise CheckFailed("A backward with W1 doubled and b2 the wrong way round.", expected=want, actual=repr(got))


def check_leaves_weights(ctx):
    m = load(ctx)
    m.backward = ref_backward
    X, T, params = brain(9, 2, 3, 1, 4)
    before = copy(params)
    m.check_gradients(X, T, params)
    for name in KEYS:
        if not np.array_equal(params[name], before[name]):
            raise CheckFailed(f"check_gradients changed params['{name}']. Checking should leave the weights as they were.")


def one_step(ctx):
    m = load(ctx)
    m.backward = ref_backward
    X, T, params = brain(13, 2, 3, 1, 4)
    start = copy(params)
    P, cache = ref_forward(X, start)
    grads = ref_backward(X, T, start, cache)
    losses = m.train(X, T, params, 0.5, 1)
    if losses is None or len(losses) != 1:
        raise CheckFailed("One step of training should give back a list of one loss.", actual=repr(losses))
    if abs(float(losses[0]) - ref_loss(P, T)) > 1e-9:
        raise CheckFailed("The loss for a step is measured before that step's update.", expected=round(ref_loss(P, T), 6), actual=round(float(losses[0]), 6))
    for name in KEYS:
        want = start[name] - 0.5 * grads[name]
        if not np.allclose(params[name], want):
            raise CheckFailed(f"After one step at rate 0.5, params['{name}'] should be its old value minus 0.5 times its gradient.",
                              expected=np.round(want, 5).tolist(), actual=np.round(params[name], 5).tolist())


def learns(ctx):
    m = load(ctx)
    X, T, params = ferro()
    losses = m.train(X, T, params, 2.0, 300)
    if losses is None or len(losses) != 300:
        raise CheckFailed("300 steps should give back 300 losses.", actual=None if losses is None else len(losses))
    first, last = float(losses[0]), float(losses[-1])
    if not first > last or last > 0.01:
        raise CheckFailed("Training on the captain's crossings should bring the loss right down.",
                          expected="from 0.2181 to below 0.01", actual=f"from {first:.4f} to {last:.4f}")
    P, _ = ref_forward(X, params)
    if ((P > 0.5) != (T > 0.5)).any():
        raise CheckFailed("After training, the brain should sail on the right crossings.", expected=[1, 0, 0, 1], actual=(P.ravel() > 0.5).astype(int).tolist())


def program(ctx):
    import re
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    lines = r.lines()
    want = "Gradients: W1 ok, b1 ok, W2 ok, b2 ok"
    if want not in lines:
        raise CheckFailed("The program should check every gradient first, and find them all ok.", expected=want, actual=r.output)
    found = [re.match(r"All three right on (\d+) of 200 evenings it never saw", line) for line in lines]
    found = [f for f in found if f]
    if not found:
        raise CheckFailed("The program should say how many of the 200 held-back evenings it gets all three right.",
                          expected="All three right on ... of 200 evenings it never saw", actual=r.output)
    if int(found[0].group(1)) < 180:
        raise CheckFailed("After training, it should get all three answers right on most of the evenings it never saw.",
                          expected="at least 180 of 200", actual=found[0].group(0))
    if "Tonight: lamp, horn, gate" not in lines:
        raise CheckFailed("Thick fog, a gale, a spring tide, after dark: every answer should be yes.",
                          expected="Tonight: lamp, horn, gate", actual=r.output)


TESTS = [
    custom("Gradients come back with the right keys and shapes", shapes, visible=True),
    custom("Every gradient matches the measured one: a 2-3-1 brain", small, visible=True),
    custom("A wider brain with three answers", wide,
           hint="The loss is the mean over every answer, so dP divides by P.size, not by the number of examples."),
    custom("A hidden neuron that never fires passes no blame", asleep,
           hint="dZ1 = dH * (Z1 > 0): blame gets back through the ReLU only where it let the number through."),
    custom("One example on its own", single),
    custom("backward leaves the weights alone", untouched),
    custom("backward has no loop", no_loop,
           hint="X.T @ dZ1 and dZ1.sum(axis=0) handle every example at once."),
    custom("check_gradients passes a correct backward", passes_good,
           hint="Work out the gradients once with backward, then measure each weight with numerical_gradient and compare with np.allclose."),
    custom("check_gradients catches a wrong backward", catches_bad,
           hint="Compare each gradient separately, so one wrong key doesn't make the others look wrong."),
    custom("check_gradients leaves the weights as they were", check_leaves_weights),
    custom("One step of training, every number", one_step,
           hint="Note the loss before updating, then subtract rate times each gradient from its weight."),
    custom("Training learns the captain's rule", learns,
           hint="Move against the gradient: subtract it. Adding it climbs the hill instead of going down."),
    custom("The program checks, trains, then answers", program),
]
