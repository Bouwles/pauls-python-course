import numpy as np


def measure(ctx, array, f):
    m = ctx.module()
    got = m.numerical_gradient(f, array)
    if got is None:
        raise CheckFailed("numerical_gradient gave back None. It should return the array of slopes.")
    return np.asarray(got, dtype=float)


def squares(ctx):
    weights = np.array([[1.0, -2.0], [0.5, 3.0]])
    got = measure(ctx, weights, lambda: np.sum(weights ** 2))
    want = 2 * np.array([[1.0, -2.0], [0.5, 3.0]])
    if got.shape != want.shape or not np.allclose(got, want, atol=1e-4):
        raise CheckFailed("The slope of the sum of squares is twice each number.", expected=want.tolist(), actual=np.round(got, 4).tolist())


def left_alone(ctx):
    weights = np.array([[1.0, -2.0], [0.5, 3.0]])
    before = weights.copy()
    measure(ctx, weights, lambda: np.sum(weights ** 2))
    if not np.array_equal(weights, before):
        raise CheckFailed("After measuring, every weight should be exactly what it was.", expected=before.tolist(), actual=weights.tolist())


def cubes(ctx):
    biases = np.array([0.5, -1.0, 2.0])
    got = measure(ctx, biases, lambda: np.sum(biases ** 3))
    want = 3 * np.array([0.5, -1.0, 2.0]) ** 2
    if got.shape != want.shape or not np.allclose(got, want, atol=1e-4):
        raise CheckFailed("The slope of the sum of cubes is three times each number squared.", expected=want.tolist(), actual=np.round(got, 4).tolist())


def through_a_product(ctx):
    X = np.array([[1.0, 2.0], [0.5, -1.0], [2.0, 0.0]])
    W = np.array([[0.3, -0.2], [0.1, 0.4]])
    want = X.T @ (2 * (X @ W))
    got = measure(ctx, W, lambda: np.sum((X @ W) ** 2))
    if got.shape != want.shape or not np.allclose(got, want, atol=1e-4):
        raise CheckFailed("A loss that reaches W through X @ W.", expected=np.round(want, 4).tolist(), actual=np.round(got, 4).tolist())
    if not np.array_equal(W, [[0.3, -0.2], [0.1, 0.4]]):
        raise CheckFailed("W should be exactly as it was afterwards.", actual=W.tolist())


TESTS = [
    custom("The slope of a sum of squares", squares, visible=True),
    custom("The weights are left exactly as they were", left_alone, visible=True),
    custom("The slope of a sum of cubes, for a row of biases", cubes,
           hint="Up is one step above, down one step below: that's two steps apart."),
    custom("A loss that goes through a matrix product", through_a_product,
           hint="If the slopes drift as the loop goes on, an earlier nudge was never undone."),
]
