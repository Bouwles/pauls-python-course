import numpy as _np

NEEDED = ("predict", "mse", "fit_closed_form")


def _module(ctx):
    mod = ctx.module()
    for name in NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"line.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _readings():
    data = _np.loadtxt("focus.csv", delimiter=",", skiprows=1)
    return data[:, 1], data[:, 2]


def _array(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    return _np.asarray(value, dtype=float)


def _one_number(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    if _np.ndim(value) != 0:
        raise CheckFailed(f"{what} should give back one number, not an array.", actual=repr(value))
    return float(value)


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two numbers, w and b.")
    try:
        w, b = value
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two numbers: w, b.", actual=repr(value))
    return float(w), float(b)


def predict_three(ctx):
    mod = _module(ctx)
    got = _array(mod.predict(_np.array([0.0, 2.0, 4.0]), 0.5, 1.0), "predict")
    if got.shape != (3,) or not _np.allclose(got, [1.0, 2.0, 3.0]):
        raise CheckFailed("One prediction per temperature: 0.5 * temperature + 1.",
                          expected=[1.0, 2.0, 3.0], actual=got.tolist())


def mse_small(ctx):
    mod = _module(ctx)
    got = _one_number(mod.mse(_np.array([1.0, 2.0, 3.0]), _np.array([1.0, 2.0, 5.0])), "mse")
    if abs(got - 4 / 3) > 1e-9:
        raise CheckFailed("The misses are 0, 0 and -2. Squared: 0, 0, 4. The mean of those is 4/3.",
                          expected=round(4 / 3, 6), actual=got)


def predict_one(ctx):
    mod = _module(ctx)
    got = _one_number(mod.predict(4.0, -0.12, 42.3), "predict(4.0, -0.12, 42.3)")
    if abs(got - 41.82) > 1e-9:
        raise CheckFailed("At 4 degrees the line -0.12 * t + 42.3 gives 41.82.", expected=41.82, actual=got)


def mse_one_number(ctx):
    mod = _module(ctx)
    got = _one_number(mod.mse(_np.array([2.0, 4.0, 6.0, 8.0]), _np.array([1.0, 5.0, 6.0, 10.0])), "mse")
    if abs(got - 1.5) > 1e-9:
        raise CheckFailed("Misses of 1, -1, 0 and -2 square to 1, 1, 0 and 4: a mean of 1.5.", expected=1.5, actual=got)


def mse_no_cancelling(ctx):
    mod = _module(ctx)
    got = _one_number(mod.mse(_np.array([3.0, 0.0]), _np.array([1.0, 2.0])), "mse")
    if abs(got - 4.0) > 1e-9:
        raise CheckFailed("One miss of +2 and one of -2. Squared, both are 4, so the mean is 4, not 0.",
                          expected=4.0, actual=got)


def fit_exact_line(ctx):
    mod = _module(ctx)
    x = _np.array([0.0, 1.0, 2.0, 3.0, 4.0])
    w, b = _pair(mod.fit_closed_form(x, 2 * x + 1), "fit_closed_form")
    if abs(w - 2) > 1e-9 or abs(b - 1) > 1e-9:
        raise CheckFailed("Every point is on y = 2x + 1, so the best line is that one.",
                          expected="(2.0, 1.0)", actual=f"({w}, {b})")


def fit_penhallow(ctx):
    mod = _module(ctx)
    x, y = _readings()
    want_w, want_b = _np.polyfit(x, y, 1)
    w, b = _pair(mod.fit_closed_form(x, y), "fit_closed_form")
    if abs(w - want_w) > 1e-6 or abs(b - want_b) > 1e-6:
        raise CheckFailed("That isn't the best line through Penhallow's readings.",
                          expected=f"({want_w:.4f}, {want_b:.3f})", actual=f"({w:.4f}, {b:.3f})")


TESTS = [
    custom("predict([0, 2, 4], w=0.5, b=1) gives [1, 2, 3]", predict_three, visible=True),
    custom("mse of [1, 2, 3] against [1, 2, 5] is 4/3", mse_small, visible=True),
    custom("predict works for one temperature too", predict_one,
           hint="If only this fails, use plain arithmetic: w * temperatures + b works for one number and for a whole array."),
    custom("mse gives back one number", mse_one_number,
           hint="If only this fails, take the mean of the squared misses, so mse gives one number, not an array."),
    custom("Misses above and below don't cancel", mse_no_cancelling,
           hint="If only this fails, square each miss before taking the mean."),
    custom("fit_closed_form finds y = 2x + 1 from points on it", fit_exact_line,
           hint="If only this fails, check the order: work out w first, then b = mean_y - w * mean_x."),
    custom("fit_closed_form on Penhallow's readings", fit_penhallow),
    structure("Worked out by the formula", forbids_calls=["polyfit", "lstsq"],
              message="Work w and b out with the formula. np.polyfit would do it for you, which isn't the point yet."),
    output("Prints the line", expect="By formula: focus = -0.1211 * temperature + 42.318", match="contains",
           hint="Four decimal places for w and three for b: {w:.4f} and {b:.3f}."),
    output("Prints the mean squared error", expect="Mean squared error: 0.0026", match="contains"),
]
