import numpy as _np

NEEDED = ("predict", "mse", "fit_closed_form", "gradients", "gradient_descent")


def _module(ctx):
    mod = ctx.module()
    for name in NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"house_prices.py needs a function called {name}.")
    return mod


def _sales():
    data = _np.loadtxt("king_county_houses.csv", delimiter=",", skiprows=1, usecols=(1, 2))
    return data[:, 1], data[:, 0]


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two numbers.")
    try:
        first, second = value
        return float(first), float(second)
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two numbers.", actual=repr(value))


def _descend(mod, x, y, rate, steps):
    result = mod.gradient_descent(x, y, rate, steps)
    if result is None:
        raise CheckFailed("gradient_descent gave back None. It should return w, b and the list of losses.")
    try:
        w, b, losses = result
    except (TypeError, ValueError):
        raise CheckFailed("gradient_descent should return three things: w, b, losses.", actual=repr(result)[:200])
    return float(w), float(b), _np.asarray(losses, dtype=float)


def _loss(x, y, w, b):
    return _np.mean((w * x + b - y) ** 2)


def small_gradients(ctx):
    mod = _module(ctx)
    dw, db = _pair(mod.gradients(_np.array([1.0, 3.0]), _np.array([2.0, 4.0]), 0.0, 0.0), "gradients")
    if abs(dw + 14) > 1e-9 or abs(db + 6) > 1e-9:
        raise CheckFailed("At w = 0, b = 0 the misses are -2 and -4. dw = 2 * mean([-2 * 1, -4 * 3]) = -14; db = 2 * mean([-2, -4]) = -6.",
                          expected="(-14.0, -6.0)", actual=f"({dw}, {db})")


def lands_on_formula(ctx):
    mod = _module(ctx)
    areas, prices = _sales()
    x = areas / 100
    want_w, want_b = _np.polyfit(x, prices, 1)
    w, b, losses = _descend(mod, x, prices, 0.1, 2000)
    if not (abs(w - want_w) < 1e-6 * abs(want_w) and abs(b - want_b) < 1e-6 * abs(want_b)):
        raise CheckFailed("In hundreds of square metres, 2,000 steps at a rate of 0.1 should end on the formula's line.",
                          expected=f"w = {want_w:.0f}, b = {want_b:.0f}", actual=f"w = {w:.6g}, b = {b:.6g}")


def loss_goes_down(ctx):
    mod = _module(ctx)
    areas, prices = _sales()
    w, b, losses = _descend(mod, areas / 100, prices, 0.1, 300)
    if len(losses) != 300:
        raise CheckFailed("300 steps should give 300 losses: the loss before each step.", expected=300, actual=len(losses))
    if not _np.all(_np.isfinite(losses)):
        raise CheckFailed("Some losses aren't numbers any more. At a rate of 0.1, in hundreds of square metres, the walk shouldn't blow up.")
    rises = [i for i in range(1, len(losses)) if losses[i] > losses[i - 1] * (1 + 1e-12)]
    if rises:
        i = rises[0]
        raise CheckFailed(f"The loss went up at step {i}. Downhill means every step lowers it.",
                          expected=f"at most {losses[i - 1]:.6g}", actual=f"{losses[i]:.6g}")


def matches_numerical(ctx):
    mod = _module(ctx)
    rng = _np.random.default_rng(5)
    x = rng.uniform(0.5, 4.0, 20)
    y = 3.5 * x - 1.4 + rng.normal(0, 0.8, 20)
    nudge = 1e-6
    for w, b in [(0.0, 0.0), (1.0, 2.0), (4.0, -3.0)]:
        num_dw = (_loss(x, y, w + nudge, b) - _loss(x, y, w - nudge, b)) / (2 * nudge)
        num_db = (_loss(x, y, w, b + nudge) - _loss(x, y, w, b - nudge)) / (2 * nudge)
        dw, db = _pair(mod.gradients(x, y, w, b), "gradients")
        if not (_np.isclose(dw, num_dw, rtol=1e-4, atol=1e-6) and _np.isclose(db, num_db, rtol=1e-4, atol=1e-6)):
            raise CheckFailed(f"At w = {w}, b = {b}, nudging w and b a tiny amount says the slopes are different.",
                              expected=f"({num_dw:.4f}, {num_db:.4f})", actual=f"({dw:.4f}, {db:.4f})")


def first_step(ctx):
    mod = _module(ctx)
    x = _np.array([1.0, 2.0, 4.0])
    y = _np.array([3.0, 5.0, 4.0])
    w, b, losses = _descend(mod, x, y, 0.01, 1)
    want_w = -0.01 * 2 * _np.mean(-y * x)
    want_b = -0.01 * 2 * _np.mean(-y)
    if len(losses) != 1 or abs(losses[0] - _np.mean(y ** 2)) > 1e-9:
        raise CheckFailed("One step should give one loss: the loss at w = 0, b = 0, before the step.",
                          expected=[round(float(_np.mean(y ** 2)), 4)], actual=_np.round(losses, 4).tolist())
    if abs(w - want_w) > 1e-9 or abs(b - want_b) > 1e-9:
        raise CheckFailed("After one step from w = 0, b = 0, w and b should each have moved by rate times their slope.",
                          expected=f"w = {want_w:.4f}, b = {want_b:.4f}", actual=f"w = {w:.4f}, b = {b:.4f}")


def other_points(ctx):
    mod = _module(ctx)
    x = _np.array([0.0, 1.0, 2.0, 3.0])
    w, b, losses = _descend(mod, x, 2 * x + 1, 0.05, 2000)
    if abs(w - 2) > 1e-3 or abs(b - 1) > 1e-3:
        raise CheckFailed("Points on y = 2x + 1, rate 0.05, 2,000 steps: the walk should end at w = 2, b = 1.",
                          expected="w = 2.000, b = 1.000", actual=f"w = {w:.4g}, b = {b:.4g}")


TESTS = [
    custom("gradients([1, 3], [2, 4], w=0, b=0) is (-14, -6)", small_gradients, visible=True),
    custom("2,000 steps at 0.1 land on the formula's line", lands_on_formula, visible=True),
    custom("The slopes match slopes measured by nudging", matches_numerical,
           hint="If only this fails, check the 2 and the sign: the miss is the prediction minus the price."),
    custom("One step from w = 0, b = 0", first_step,
           hint="If only this fails, start from w = 0 and b = 0, keep the loss before each step, then step."),
    custom("The loss goes down every step", loss_goes_down),
    custom("Points on y = 2x + 1", other_points),
    output("Still prints the formula's line", expect="By formula: w = 3515.36, b = -140390", match="contains"),
    output("Prints the line found on foot, per square metre", expect="By descent: w = 3515.36, b = -140390", match="contains",
           hint="If only this fails, the walk was in hundreds of square metres, so its w is the price per hundred. Divide it by 100."),
]
