import numpy as np


def reference(Z):
    e = np.exp(Z - Z.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


def chances(ctx, Z, what):
    m = ctx.module()
    got = m.softmax(np.array(Z, dtype=float))
    if got is None:
        raise CheckFailed(f"{what}: softmax gave back None.")
    got = np.asarray(got, dtype=float)
    want = reference(np.array(Z, dtype=float))
    if got.shape != want.shape:
        raise CheckFailed(f"{what}: the shape.", expected=str(want.shape), actual=str(got.shape))
    if not np.all(np.isfinite(got)) or not np.allclose(got, want, atol=1e-9):
        raise CheckFailed(what, expected=np.round(want, 4).tolist(), actual=np.round(got, 4).tolist())


def rows_add_up(ctx):
    m = ctx.module()
    got = np.asarray(m.softmax(np.array([[2.0, 1.0, 0.0], [0.0, 3.0, 1.0]])), dtype=float)
    if not np.allclose(got.sum(axis=1), 1.0):
        raise CheckFailed("Each row is one digit's chances, so each row adds up to 1.", expected=[1.0, 1.0], actual=np.round(got.sum(axis=1), 4).tolist())


def known(ctx):
    chances(ctx, [[2.0, 1.0, 0.0], [0.0, 3.0, 1.0]], "Two rows of three scores")


def big(ctx):
    chances(ctx, [[1000.0, 1001.0, 998.0]], "Scores in the thousands")


def scales(ctx):
    chances(ctx, [[1000.0, 1001.0], [0.0, 1.0]], "One row of big scores and one of small")


def one_row(ctx):
    chances(ctx, [np.linspace(-2, 3, 10)], "One digit's ten scores")


def many(ctx):
    chances(ctx, np.random.default_rng(3).normal(0, 4, (6, 10)), "Six digits' scores")


TESTS = [
    custom("Each row adds up to 1", rows_add_up, visible=True),
    custom("Two rows of known chances", known, visible=True),
    custom("Scores in the thousands", big),
    custom("Rows on very different scales", scales,
           hint="Subtracting the biggest score in the whole array can push a row of small scores so far down that every exp is 0. Shift each row by its own biggest: Z.max(axis=1, keepdims=True)."),
    custom("One row of ten", one_row),
    custom("Six rows of ten", many),
]
