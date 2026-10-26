import numpy as _np


def _module(ctx):
    mod = ctx.module()
    if not callable(getattr(mod, "fit_sklearn", None)):
        raise CheckFailed("house_prices.py needs a function called fit_sklearn.")
    return mod


def _sales():
    data = _np.loadtxt("king_county_houses.csv", delimiter=",", skiprows=1, usecols=(1, 2))
    return data[:, 1], data[:, 0]


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two numbers, w and b.")
    try:
        w, b = value
        return float(w), float(b)
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two numbers: w, b.", actual=repr(value)[:200])


def exact_line(ctx):
    mod = _module(ctx)
    x = _np.array([0.0, 1.0, 2.0, 3.0, 4.0])
    w, b = _pair(mod.fit_sklearn(x, 2 * x + 1), "fit_sklearn")
    if abs(w - 2) > 1e-9 or abs(b - 1) > 1e-9:
        raise CheckFailed("Every point is on y = 2x + 1, so LinearRegression should find exactly that.",
                          expected="(2.0, 1.0)", actual=f"({w}, {b})")


def the_sales(ctx):
    mod = _module(ctx)
    x, y = _sales()
    want_w, want_b = _np.polyfit(x, y, 1)
    w, b = _pair(mod.fit_sklearn(x, y), "fit_sklearn")
    if abs(w - want_w) > 1e-6 * abs(want_w) or abs(b - want_b) > 1e-6 * abs(want_b):
        raise CheckFailed("scikit-learn's line through the thousand sales should be the formula's line.",
                          expected=f"({want_w:.2f}, {want_b:.0f})", actual=f"({w:.2f}, {b:.0f})")


def plain_numbers(ctx):
    mod = _module(ctx)
    x = _np.array([10.0, 20.0, 30.0])
    w, b = _pair(mod.fit_sklearn(x, _np.array([5.0, 9.0, 13.0])), "fit_sklearn")
    if abs(w - 0.4) > 1e-9 or abs(b - 1.0) > 1e-9:
        raise CheckFailed("Three points on y = 0.4x + 1.", expected="(0.4, 1.0)", actual=f"({w}, {b})")


TESTS = [
    custom("fit_sklearn finds y = 2x + 1 from points on it", exact_line, visible=True),
    output("Prices a house of 150 square metres", inputs=["150"],
           expect="A house of 150 square metres: about $387,000", match="contains", visible=True),
    custom("fit_sklearn gives the formula's line on the thousand sales", the_sales),
    custom("fit_sklearn hands back two plain numbers", plain_numbers,
           hint="If only this fails, coef_ is an array with one weight in it. Hand back coef_[0], not the array."),
    structure("Asks scikit-learn", calls=["LinearRegression"],
              message="Make the model with LinearRegression() and let fit find the line."),
    output("Prints scikit-learn's line", inputs=["150"], expect="scikit-learn: w = 3515.36, b = -140390", match="contains"),
    output("Still prints the root mean squared error", inputs=["150"], expect="Root mean squared error: $288,893", match="contains"),
    output("Prices a house of 95.5 square metres", inputs=["95.5"],
           expect="A house of 95.5 square metres: about $195,000", match="contains",
           hint="If only this fails, show the area as it was typed: {area:g} gives 95.5, and 150 rather than 150.0."),
    output("Prices a house of 300 square metres", inputs=["300"],
           expect="A house of 300 square metres: about $914,000", match="contains"),
    output("Won't price a mansion it has never seen", inputs=["2000"],
           expect="The sales run from 36 to 919 square metres. Outside that, the line is guessing.", match="contains",
           hint="If only this fails, compare the area with areas.min() and areas.max() before pricing it."),
    output("Won't price a house of 0 square metres", inputs=["0"],
           expect="The sales run from 36 to 919 square metres. Outside that, the line is guessing.", match="contains"),
    output("Says so when the area isn't a number", inputs=["big"], expect="That's not a floor area.", match="contains",
           hint="If only this fails, float('big') raises a ValueError. Catch it with try and except."),
]
