import re as _re

import numpy as _np

NEEDED = ("train_test_split", "polynomial_features", "fit_polynomial", "predict_polynomial",
          "mse", "validation_curve", "choose_degree")
TABLE = [
    (1, 0.553, 0.475), (2, 0.140, 0.085), (3, 0.087, 0.018), (4, 0.077, 0.029), (5, 0.076, 0.033),
    (6, 0.071, 0.050), (7, 0.069, 0.064), (8, 0.068, 0.084), (9, 0.065, 0.113), (10, 0.064, 0.126),
]


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"mirror.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _readings():
    data = _np.loadtxt("cooling.csv", delimiter=",", skiprows=1)
    return data[:, 1], data[:, 2]


def _features(x, degree):
    return _np.column_stack([x ** power for power in range(degree + 1)])


def _errors(x_train, y_train, x_val, y_val, degrees):
    train_errors, val_errors = [], []
    for degree in degrees:
        weights = _np.linalg.lstsq(_features(x_train, degree), y_train, rcond=None)[0]
        train_errors.append(_np.mean((_features(x_train, degree) @ weights - y_train) ** 2))
        val_errors.append(_np.mean((_features(x_val, degree) @ weights - y_val) ** 2))
    return train_errors, val_errors


def _split(mod, x, y, fraction, seed):
    result = mod.train_test_split(x, y, fraction, _np.random.default_rng(seed))
    if result is None:
        raise CheckFailed("train_test_split gave back None. It should return x_train, x_test, y_train, y_test.")
    try:
        x_train, x_test, y_train, y_test = result
    except (TypeError, ValueError):
        raise CheckFailed("train_test_split should return four arrays: x_train, x_test, y_train, y_test.", actual=repr(result)[:200])
    return [_np.asarray(part, dtype=float) for part in (x_train, x_test, y_train, y_test)]


def split_ten(ctx):
    mod = _module(ctx, "train_test_split")
    x = _np.arange(10.0) * 0.5
    y = 10 * x
    x_train, x_test, y_train, y_test = _split(mod, x, y, 0.3, 0)
    order = _np.random.default_rng(0).permutation(10)
    if len(x_test) != 3 or len(x_train) != 7:
        raise CheckFailed("Ten readings with a test fraction of 0.3: three for testing, seven for training.",
                          expected="7 and 3", actual=f"{len(x_train)} and {len(x_test)}")
    if not (_np.allclose(y_train, 10 * x_train) and _np.allclose(y_test, 10 * x_test)):
        raise CheckFailed("Each x has to stay with its own y. Shuffle the positions once and use them for both.")
    if not (_np.allclose(x_test, x[order[:3]]) and _np.allclose(x_train, x[order[3:]])):
        raise CheckFailed("Use order = rng.permutation(len(x)); the first three positions in order are the test readings.",
                          expected=f"x_test {x[order[:3]].tolist()}", actual=f"x_test {x_test.tolist()}")


def features_small(ctx):
    mod = _module(ctx, "polynomial_features")
    got = _np.asarray(mod.polynomial_features(_np.array([1.0, 2.0, 3.0]), 2), dtype=float)
    want = [[1.0, 1.0, 1.0], [1.0, 2.0, 4.0], [1.0, 3.0, 9.0]]
    if got.shape != (3, 3) or not _np.allclose(got, want):
        raise CheckFailed("One row per reading, with columns x ** 0, x ** 1 and x ** 2.", expected=want, actual=got.tolist())


def features_degree_zero(ctx):
    mod = _module(ctx, "polynomial_features")
    got = _np.asarray(mod.polynomial_features(_np.array([4.0, 5.0]), 0), dtype=float)
    if got.shape != (2, 1) or not _np.allclose(got, 1.0):
        raise CheckFailed("Degree 0 is a single column: x ** 0, all ones.", expected=[[1.0], [1.0]], actual=got.tolist())


def split_sixty(ctx):
    mod = _module(ctx, "train_test_split")
    x, y = _readings()
    x_train, x_test, y_train, y_test = _split(mod, x, y, 0.2, 5)
    if len(x_test) != 12 or len(x_train) != 48:
        raise CheckFailed("A fifth of sixty readings is twelve.", expected="48 and 12", actual=f"{len(x_train)} and {len(x_test)}")
    together = sorted(zip(_np.concatenate([x_train, x_test]), _np.concatenate([y_train, y_test])))
    if together != sorted(zip(x, y)):
        raise CheckFailed("Every reading should end up in exactly one of the two parts.")


def fit_known_curve(ctx):
    mod = _module(ctx, "polynomial_features", "fit_polynomial")
    x = _np.linspace(0, 3, 7)
    weights = _np.asarray(mod.fit_polynomial(x, 1 + 2 * x - 0.5 * x ** 2, 2), dtype=float)
    if weights.shape != (3,) or not _np.allclose(weights, [1.0, 2.0, -0.5], atol=1e-8):
        raise CheckFailed("The points are on 1 + 2x - 0.5x ** 2, so the weights, from x ** 0 up, are 1, 2 and -0.5.",
                          expected=[1.0, 2.0, -0.5], actual=_np.round(weights, 4).tolist())


def predict_known(ctx):
    mod = _module(ctx, "polynomial_features", "predict_polynomial")
    got = _np.asarray(mod.predict_polynomial(_np.array([0.0, 1.0, 2.0]), _np.array([1.0, 0.0, 2.0])), dtype=float)
    if got.shape != (3,) or not _np.allclose(got, [1.0, 3.0, 9.0]):
        raise CheckFailed("Weights 1, 0, 2 mean 1 + 2x ** 2: 1, 3 and 9 at x = 0, 1, 2.", expected=[1.0, 3.0, 9.0], actual=got.tolist())


def curve_on_readings(ctx):
    mod = _module(ctx)
    x, y = _readings()
    x_train, x_val, y_train, y_val = x[:40], x[40:], y[:40], y[40:]
    degrees = [1, 2, 3, 4, 5, 6]
    result = mod.validation_curve(x_train, y_train, x_val, y_val, degrees)
    try:
        train_errors, val_errors = result
    except (TypeError, ValueError):
        raise CheckFailed("validation_curve should return two lists: training errors and validation errors.", actual=repr(result)[:200])
    want_train, want_val = _errors(x_train, y_train, x_val, y_val, degrees)
    if len(train_errors) != 6 or len(val_errors) != 6:
        raise CheckFailed("Six degrees, so six errors in each list.", expected="6 and 6", actual=f"{len(train_errors)} and {len(val_errors)}")
    if not _np.allclose(train_errors, want_train, rtol=1e-6):
        raise CheckFailed("The training errors are off. Fit each curve on the training readings and score it on them.",
                          expected=_np.round(want_train, 4).tolist(), actual=_np.round(_np.asarray(train_errors, dtype=float), 4).tolist())
    if not _np.allclose(val_errors, want_val, rtol=1e-6):
        raise CheckFailed("The validation errors are off. Fit on the training readings, then score on the validation ones.",
                          expected=_np.round(want_val, 4).tolist(), actual=_np.round(_np.asarray(val_errors, dtype=float), 4).tolist())


def _choice(ctx, x_train, y_train, x_val, y_val, degrees, what):
    mod = _module(ctx)
    train_errors, val_errors = _errors(x_train, y_train, x_val, y_val, degrees)
    want = degrees[int(_np.argmin(val_errors))]
    got = mod.choose_degree(x_train, y_train, x_val, y_val, degrees)
    if got != want:
        raise CheckFailed(f"{what} The degree with the lowest validation error is {want}.", expected=want, actual=got)


def choose_quadratic(ctx):
    rng = _np.random.default_rng(1)
    x_train, x_val = _np.linspace(0, 1, 8), _np.linspace(0.05, 0.95, 8)
    y_train = 1 + 2 * x_train - 3 * x_train ** 2 + rng.normal(0, 0.05, 8)
    y_val = 1 + 2 * x_val - 3 * x_val ** 2 + rng.normal(0, 0.05, 8)
    _choice(ctx, x_train, y_train, x_val, y_val, [1, 2, 3, 4, 5, 6], "Degree 6 fits the training points best; that isn't the question.")


def choose_odd(ctx):
    rng = _np.random.default_rng(2)
    x_train, x_val = _np.linspace(0, 2, 10), _np.linspace(0.1, 1.9, 10)
    y_train = _np.sin(3 * x_train) + rng.normal(0, 0.05, 10)
    y_val = _np.sin(3 * x_val) + rng.normal(0, 0.05, 10)
    _choice(ctx, x_train, y_train, x_val, y_val, [1, 3, 5, 7, 9], "Only odd degrees this time.")


def beats_guessing(ctx):
    mod = _module(ctx)
    x, y = _readings()
    x_rest, x_test, y_rest, y_test = _split(mod, x, y, 0.2, 11)
    rng = _np.random.default_rng(12)
    x_train, x_val, y_train, y_val = [_np.asarray(p, dtype=float) for p in mod.train_test_split(x_rest, y_rest, 0.25, rng)]
    degree = mod.choose_degree(x_train, y_train, x_val, y_val, list(range(1, 9)))
    weights = mod.fit_polynomial(x_train, y_train, degree)
    test_error = float(_np.mean((_np.asarray(mod.predict_polynomial(x_test, weights)) - y_test) ** 2))
    guessing = float(_np.mean((_np.mean(y_train) - y_test) ** 2))
    if not test_error < guessing / 4:
        raise CheckFailed("On a different split, the chosen curve should beat guessing the average by a long way on the test readings.",
                          expected=f"well under {guessing:.3f}", actual=f"{test_error:.3f}")


def _line(ctx, start, want, why):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    lines = [line.strip() for line in result.output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=result.output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def chosen(ctx):
    _line(ctx, "Chosen degree:", "Chosen degree: 3", "Choose the degree with the lowest validation error.")


def test_error(ctx):
    _line(ctx, "Test error:", "Test error: 0.121",
          "Fit the chosen degree on the training readings, then score it on the test readings, to three places.")


def guessing(ctx):
    _line(ctx, "Guessing the average:", "Guessing the average: 1.633",
          "Guess the mean of the training readings for every test reading, and score that, to three places.")


def table(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    rows = {}
    for line in result.output.splitlines():
        found = _re.match(r"^\s*(\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$", line)
        if found:
            rows[int(found.group(1))] = (float(found.group(2)), float(found.group(3)))
    for degree, train_error, val_error in TABLE:
        if degree not in rows:
            raise CheckFailed(f"There's no row for degree {degree}: the degree, then the training error, then the validation error.",
                              expected=f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}", actual=result.output)
        got_train, got_val = rows[degree]
        if abs(got_train - train_error) > 0.0015 or abs(got_val - val_error) > 0.0015:
            raise CheckFailed(f"The errors for degree {degree} are off. Is the split exactly as the requirements say?",
                              expected=f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}",
                              actual=f"{degree:6}  {got_train:8.3f}  {got_val:10.3f}")


TESTS = [
    custom("train_test_split keeps 3 of 10 readings for testing", split_ten, visible=True),
    custom("polynomial_features([1, 2, 3], 2) has columns 1, x and x ** 2", features_small, visible=True),
    custom("Degree 0 is a column of ones", features_degree_zero,
           hint="If only this fails, remember range(degree + 1) starts at 0, and x ** 0 is 1."),
    custom("A fifth of sixty readings is twelve", split_sixty),
    custom("fit_polynomial finds 1 + 2x - 0.5x ** 2", fit_known_curve,
           hint="If only this fails, check the order of the weights: x ** 0 first, then x ** 1, and so on."),
    custom("predict_polynomial with weights 1, 0, 2", predict_known),
    custom("validation_curve on the mirror readings", curve_on_readings),
    custom("choose_degree picks by validation error", choose_quadratic),
    custom("Degrees 1, 3, 5, 7 and 9", choose_odd,
           hint="If only this fails, give back the degree from the list, not its position in it."),
    custom("The chosen curve beats guessing the average", beats_guessing),
    custom("Prints the validation curve", table),
    custom("Chooses a degree", chosen),
    custom("Opens the test readings once", test_error),
    custom("Compares with guessing the average", guessing),
]
