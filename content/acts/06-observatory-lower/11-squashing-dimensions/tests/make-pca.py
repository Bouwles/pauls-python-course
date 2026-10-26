import numpy as _np


def _module(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"segments.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two things.")
    try:
        first, second = value
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two things.", actual=repr(value)[:200])
    return _np.asarray(first, dtype=float), _np.asarray(second, dtype=float)


def _correlated(seed=6, n=80):
    rng = _np.random.default_rng(seed)
    mixing = _np.array([[3.0, 0.0, 0.0, 0.0], [1.0, 1.5, 0.0, 0.0], [0.5, -0.5, 0.8, 0.0], [0.2, 0.3, 0.1, 0.3]])
    return rng.normal(size=(n, 4)) @ mixing.T + _np.array([10.0, -4.0, 2.0, 50.0])


def _reference(X):
    centred = X - X.mean(axis=0)
    values, vectors = _np.linalg.eigh(centred.T @ centred / (len(X) - 1))
    order = _np.argsort(values)[::-1]
    return values[order], vectors[:, order]


def two_by_two(ctx):
    mod = _module(ctx, "principal_components")
    X = _np.array([[2.0, 2.0], [0.0, 0.0], [-2.0, -2.0], [1.0, -1.0], [-1.0, 1.0]])
    values, vectors = _pair(mod.principal_components(X), "principal_components")
    if values.shape != (2,) or not _np.allclose(values, [4.0, 1.0]):
        raise CheckFailed("Biggest first: 4 along the slant (1, 1), then 1 across it.", expected=[4.0, 1.0], actual=_np.round(values, 3).tolist())
    if not _np.allclose(_np.abs(vectors[:, 0]), [0.7071, 0.7071], atol=1e-3):
        raise CheckFailed("The first component is a column of the eigenvector matrix: the slant (0.71, 0.71).", actual=_np.round(vectors, 3).tolist())


def biggest_first(ctx):
    mod = _module(ctx, "principal_components")
    X = _correlated()
    values, vectors = _pair(mod.principal_components(X), "principal_components")
    want_values, want_vectors = _reference(X)
    if not _np.allclose(values, want_values):
        raise CheckFailed("The variances, biggest first.", expected=_np.round(want_values, 3).tolist(), actual=_np.round(values, 3).tolist())
    for j in range(4):
        if not _np.allclose(_np.abs(vectors[:, j]), _np.abs(want_vectors[:, j]), atol=1e-6):
            raise CheckFailed(f"Component {j + 1} should be the eigenvector, as a column, that goes with variance {j + 1}.")


def centred_first(ctx):
    mod = _module(ctx, "principal_components")
    X = _correlated()
    a, _ = _pair(mod.principal_components(X), "principal_components")
    b, _ = _pair(mod.principal_components(X + 1000.0), "principal_components")
    if not _np.allclose(a, b):
        raise CheckFailed("Moving every point by 1,000 shouldn't change how they spread. Centre the columns first.")


def signs(ctx):
    mod = _module(ctx, "principal_components")
    _, vectors = _pair(mod.principal_components(_correlated(9)), "principal_components")
    for j in range(vectors.shape[1]):
        if vectors[_np.argmax(_np.abs(vectors[:, j])), j] < 0:
            raise CheckFailed(f"Turn component {j + 1} round so its biggest number is positive: the same line, pointing the other way.")


def shares(ctx):
    mod = _module(ctx, "explained_ratio")
    got = _np.asarray(mod.explained_ratio(_np.array([6.0, 3.0, 1.0])), dtype=float)
    if not _np.allclose(got, [0.6, 0.3, 0.1]):
        raise CheckFailed("Each variance over their total.", expected=[0.6, 0.3, 0.1], actual=got.tolist())


def _line(ctx, start, want, why):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    lines = [line.strip() for line in result.output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=result.output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def first(ctx):
    _line(ctx, "Component 1", "Component 1 explains 44%: milk, grocery, detergents_paper",
          "The first component's share, then the goods whose numbers in it are above 0.4.")


def second(ctx):
    _line(ctx, "Component 2", "Component 2 explains 27%: fresh, frozen, delicatessen", "The same for the second.")


def still_segments(ctx):
    _line(ctx, "Segment 1:", "Segment 1: 251 customers, 3% retail, above average on fresh, frozen",
          "The segments from the last step should still come first.")


TESTS = [
    custom("principal_components of five points on a slant", two_by_two, visible=True),
    custom("explained_ratio of 6, 3 and 1", shares, visible=True),
    custom("Variances biggest first, components as columns", biggest_first,
           hint="If only this fails, np.linalg.eigh gives the smallest first, and each eigenvector is a column. Reorder both together."),
    custom("Centred before the covariance", centred_first,
           hint="If only this fails, take each column's mean off before working out the covariance."),
    custom("Each component points its biggest number forwards", signs),
    custom("Still prints the segments", still_segments),
    custom("Describes the first component", first),
    custom("Describes the second component", second),
]
