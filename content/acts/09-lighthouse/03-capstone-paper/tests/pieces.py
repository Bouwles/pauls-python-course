import numpy as _np


def _module(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"descent.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _array(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did you forget the return?")
    return _np.asarray(value, dtype=float)


def small_features(ctx):
    mod = _module(ctx, "relu_features")
    X = _np.array([[1.0, 2.0], [3.0, -1.0]])
    W = _np.array([[1.0, -1.0, 0.5], [1.0, 1.0, -2.0]])
    got = _array(mod.relu_features(X, W), "relu_features")
    want = [[3.0, 1.0, 0.0], [2.0, 0.0, 3.5]]
    if got.shape != (2, 3) or not _np.allclose(got, want):
        raise CheckFailed("X @ W is [[3, 1, -3.5], [2, -4, 3.5]]; relu keeps the positives and makes the rest 0.",
                          expected=want, actual=got.tolist())


def known_line(ctx):
    mod = _module(ctx, "fit_min_norm")
    x = _np.array([0.0, 1.0, 2.0, 3.0, 4.0])
    features = _np.column_stack([_np.ones(5), x])
    got = _array(mod.fit_min_norm(features, 1 + 2 * x), "fit_min_norm")
    if got.shape != (2,) or not _np.allclose(got, [1.0, 2.0], atol=1e-8):
        raise CheckFailed("Five points on y = 1 + 2x, with columns 1 and x: the weights are 1 and 2.",
                          expected=[1.0, 2.0], actual=_np.round(got, 6).tolist())


def bigger_features(ctx):
    mod = _module(ctx, "relu_features")
    rng = _np.random.default_rng(8)
    X, W = rng.normal(size=(6, 4)), rng.normal(size=(4, 9))
    got = _array(mod.relu_features(X, W), "relu_features")
    if got.shape != (6, 9):
        raise CheckFailed("Six examples and nine columns in W make six rows of nine features.", expected=(6, 9), actual=got.shape)
    if not _np.allclose(got, _np.maximum(0, X @ W)):
        raise CheckFailed("Each feature is relu of one example times one column of W: X @ W, with the negatives made 0.")


def least_squares(ctx):
    mod = _module(ctx, "fit_min_norm")
    rng = _np.random.default_rng(9)
    features, y = rng.normal(size=(30, 4)), rng.normal(size=30)
    got = _array(mod.fit_min_norm(features, y), "fit_min_norm")
    want = _np.linalg.lstsq(features, y, rcond=None)[0]
    if got.shape != (4,) or not _np.allclose(got, want, atol=1e-8):
        raise CheckFailed("With more examples than features, the best fit is ordinary least squares.",
                          expected=_np.round(want, 4).tolist(), actual=_np.round(got, 4).tolist())


def fits_exactly(ctx):
    mod = _module(ctx, "fit_min_norm")
    rng = _np.random.default_rng(10)
    features, y = rng.normal(size=(5, 12)), rng.normal(size=5)
    got = _array(mod.fit_min_norm(features, y), "fit_min_norm")
    if got.shape != (12,):
        raise CheckFailed("One weight per feature: twelve features, twelve weights.", expected=(12,), actual=got.shape)
    if not _np.allclose(features @ got, y, atol=1e-8):
        raise CheckFailed("With more features than examples, the fit goes through every example exactly.",
                          expected=_np.round(y, 4).tolist(), actual=_np.round(features @ got, 4).tolist())


def smallest(ctx):
    mod = _module(ctx, "fit_min_norm")
    rng = _np.random.default_rng(11)
    features, y = rng.normal(size=(8, 40)), rng.normal(size=8)
    got = _array(mod.fit_min_norm(features, y), "fit_min_norm")
    want = _np.linalg.pinv(features) @ y
    if got.shape != (40,) or not _np.allclose(got, want, atol=1e-8):
        size = float(_np.linalg.norm(got)) if got.shape == (40,) else None
        raise CheckFailed("Many sets of weights fit eight examples exactly with forty features. Choose the one with the smallest norm.",
                          expected=f"norm {_np.linalg.norm(want):.4f}", actual=f"norm {size:.4f}" if size is not None else str(got.shape))


def mean_squared(ctx):
    mod = _module(ctx, "mse")
    got = mod.mse(_np.array([1.0, 2.0, 3.0]), _np.array([1.0, 2.0, 5.0]))
    if got is None or abs(float(got) - 4 / 3) > 1e-9:
        raise CheckFailed("Misses 0, 0 and 2; squared, 0, 0 and 4; their mean is 4/3.", expected=round(4 / 3, 6), actual=got)


TESTS = [
    custom("relu_features on two examples", small_features, visible=True),
    custom("fit_min_norm finds y = 1 + 2x", known_line, visible=True),
    custom("relu_features makes one row per example", bigger_features),
    custom("Fewer features than examples: least squares", least_squares),
    custom("More features than examples: an exact fit", fits_exactly,
           hint="If only this fails, check there is one weight per feature, and that the fit passes through every example."),
    custom("Of all the exact fits, the smallest", smallest,
           hint="If only this fails, you have an exact fit but not the smallest one. np.linalg.pinv(features) @ y gives the smallest."),
    custom("mse", mean_squared),
]
