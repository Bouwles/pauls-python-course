import numpy as _np

NEEDED = ("predict", "mse", "fit_closed_form")


def _module(ctx):
    mod = ctx.module()
    for name in NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"house_prices.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _sales():
    data = _np.loadtxt("king_county_houses.csv", delimiter=",", skiprows=1, usecols=(1, 2))
    return data[:, 1], data[:, 0]


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
    got = _array(mod.predict(_np.array([100.0, 150.0, 200.0]), 3000.0, -50000.0), "predict")
    if got.shape != (3,) or not _np.allclose(got, [250000.0, 400000.0, 550000.0]):
        raise CheckFailed("One price per area: 3000 * area - 50000.",
                          expected=[250000.0, 400000.0, 550000.0], actual=got.tolist())


def mse_small(ctx):
    mod = _module(ctx)
    got = _one_number(mod.mse(_np.array([1.0, 2.0, 3.0]), _np.array([1.0, 2.0, 5.0])), "mse")
    if abs(got - 4 / 3) > 1e-9:
        raise CheckFailed("The misses are 0, 0 and -2. Squared: 0, 0, 4. The mean of those is 4/3.",
                          expected=round(4 / 3, 6), actual=got)


def predict_one(ctx):
    mod = _module(ctx)
    got = _one_number(mod.predict(120.0, 3500.0, -140000.0), "predict(120.0, 3500.0, -140000.0)")
    if abs(got - 280000.0) > 1e-6:
        raise CheckFailed("At 120 square metres the line 3500 * area - 140000 gives 280000.", expected=280000.0, actual=got)


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


def fit_the_sales(ctx):
    mod = _module(ctx)
    x, y = _sales()
    want_w, want_b = _np.polyfit(x, y, 1)
    w, b = _pair(mod.fit_closed_form(x, y), "fit_closed_form")
    if abs(w - want_w) > 1e-6 * abs(want_w) or abs(b - want_b) > 1e-6 * abs(want_b):
        raise CheckFailed("That isn't the best line through the thousand sales.",
                          expected=f"({want_w:.2f}, {want_b:.0f})", actual=f"({w:.2f}, {b:.0f})")


TESTS = [
    custom("predict([100, 150, 200], w=3000, b=-50000) gives [250000, 400000, 550000]", predict_three, visible=True),
    custom("mse of [1, 2, 3] against [1, 2, 5] is 4/3", mse_small, visible=True),
    custom("predict works for one area too", predict_one,
           hint="If only this fails, use plain arithmetic: w * areas + b works for one number and for a whole array."),
    custom("mse gives back one number", mse_one_number,
           hint="If only this fails, take the mean of the squared misses, so mse gives one number, not an array."),
    custom("Misses above and below don't cancel", mse_no_cancelling,
           hint="If only this fails, square each miss before taking the mean."),
    custom("fit_closed_form finds y = 2x + 1 from points on it", fit_exact_line,
           hint="If only this fails, check the order: work out w first, then b = mean of y - w * mean of x."),
    custom("fit_closed_form on the thousand sales", fit_the_sales),
    structure("Worked out by the formula", forbids_calls=["polyfit", "lstsq"],
              message="Work w and b out with the formula. np.polyfit would do it for you, which isn't the point yet."),
    output("Prints the line", expect="By formula: w = 3515.36, b = -140390", match="contains",
           hint="Two decimal places for w and none for b: {w:.2f} and {b:.0f}."),
    output("Prints the root mean squared error, in dollars", expect="Root mean squared error: $288,893", match="contains",
           hint="The square root of the mean squared error, with a comma every three digits: {error:,.0f}."),
]
