import numpy as np


def params_for(seed, hidden=5):
    rng = np.random.default_rng(seed)
    return {"W1": rng.normal(0, 0.6, (7, hidden)), "b1": rng.normal(0, 0.2, hidden),
            "W2": rng.normal(0, 0.6, (hidden, 4)), "b2": rng.normal(0, 0.2, 4)}


def tiles(*pairs):
    X = np.zeros((len(pairs), 7))
    for i, (row, col) in enumerate(pairs):
        X[i, row] = 1.0
        X[i, 3 + col] = 1.0
    return X


def measured(m, params, X, actions, y, name, step=1e-6):
    grad = np.zeros_like(params[name])
    for index in np.ndindex(params[name].shape):
        old = params[name][index]
        params[name][index] = old + step
        up = m.loss(params, X, actions, y)
        params[name][index] = old - step
        down = m.loss(params, X, actions, y)
        params[name][index] = old
        grad[index] = (up - down) / (2 * step)
    return grad


def agrees(seed, X, actions, y):
    def check(ctx):
        m = ctx.module()
        params = params_for(seed)
        got = m.gradients(params, X, actions, y)
        if not isinstance(got, dict):
            raise CheckFailed("gradients should return a dictionary of gradients, keyed like params.", actual=repr(got)[:80])
        for name in ["W2", "b2", "W1", "b1"]:
            want = measured(m, params, X, actions, y, name)
            if not np.allclose(got[name], want, atol=1e-5):
                raise CheckFailed(f"The gradient for {name} doesn't match the one measured by nudging each weight.",
                                  expected=np.round(want, 3).tolist(), actual=np.round(got[name], 3).tolist())
    return check


def no_blame(ctx):
    m = ctx.module()
    params = params_for(4)
    X = tiles((2, 0), (1, 2), (0, 1))
    actions = np.array([0, 3, 0])
    got = m.gradients(params, X, actions, np.array([2.0, -1.0, 6.0]))
    for column, name in [(1, "down"), (2, "left")]:
        if not np.allclose(got["W2"][:, column], 0) or abs(got["b2"][column]) > 1e-12:
            raise CheckFailed(f"Nobody went {name} in this batch, so the weights for the {name} output should get no gradient at all.",
                              expected="zeros", actual=np.round(got["W2"][:, column], 3).tolist())


def the_start(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    import re
    numbers = [float(n) for n in re.findall(r"-?\d+\.?\d*", result.output.split(":")[-1])]
    if len(numbers) != 4 or abs(numbers[0] - 5) > 0.05:
        raise CheckFailed("After training on the one memory, up from the start should be worth 5.", actual=result.output.strip())
    if all(abs(n - 5) < 0.5 for n in numbers[1:]):
        raise CheckFailed("Down, left and right have no memories, so they shouldn't have been pulled to 5 as well.", actual=result.output.strip())


TESTS = [
    custom("Gradients for one memory", agrees(1, tiles((2, 0)), np.array([0]), np.array([5.0])), visible=True),
    custom("No blame for moves nobody made", no_blame, visible=True),
    custom("Gradients for a batch of four", agrees(2, tiles((2, 0), (2, 1), (0, 2), (1, 0)), np.array([0, 3, 3, 1]), np.array([1.5, -1.0, 10.0, 0.3]))),
    custom("Two memories from the same tile", agrees(3, tiles((1, 2), (1, 2)), np.array([0, 2]), np.array([7.0, -2.0])),
           hint="Each memory blames its own action's Q-value, at its own row."),
    custom("Pip's single memory", the_start),
]
