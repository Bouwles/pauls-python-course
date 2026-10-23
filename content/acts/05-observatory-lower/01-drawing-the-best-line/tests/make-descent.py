import numpy as _np

NEEDED = ("predict", "mse", "fit_closed_form", "gradients", "gradient_descent")


def _module(ctx):
    mod = ctx.module()
    for name in NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"line.py needs a function called {name}.")
    return mod


def _readings():
    data = _np.loadtxt("focus.csv", delimiter=",", skiprows=1)
    return data[:, 1], data[:, 2]


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
    x, y = _readings()
    want_w, want_b = _np.polyfit(x, y, 1)
    w, b, losses = _descend(mod, x, y, 0.01, 2000)
    if not (abs(w - want_w) < 1e-4 and abs(b - want_b) < 1e-3):
        raise CheckFailed("After 2,000 steps at a rate of 0.01, the walk should end on the formula's line.",
                          expected=f"w = {want_w:.4f}, b = {want_b:.3f}", actual=f"w = {w:.4g}, b = {b:.5g}")


def loss_goes_down(ctx):
    mod = _module(ctx)
    x, y = _readings()
    w, b, losses = _descend(mod, x, y, 0.01, 300)
    if len(losses) != 300:
        raise CheckFailed("300 steps should give 300 losses: the loss before each step.", expected=300, actual=len(losses))
    if not _np.all(_np.isfinite(losses)):
        raise CheckFailed("Some losses aren't numbers any more. At a rate of 0.01 the walk shouldn't blow up.")
    rises = [i for i in range(1, len(losses)) if losses[i] > losses[i - 1] + 1e-12]
    if rises:
        i = rises[0]
        raise CheckFailed(f"The loss went up at step {i}. Downhill means every step lowers it.",
                          expected=f"at most {losses[i - 1]:.6f}", actual=f"{losses[i]:.6f}")


def matches_numerical(ctx):
    mod = _module(ctx)
    rng = _np.random.default_rng(5)
    x = rng.uniform(-3, 14, 20)
    y = 42.0 - 0.12 * x + rng.normal(0, 0.1, 20)
    nudge = 1e-6
    for w, b in [(0.0, 0.0), (0.5, 40.0), (-0.3, 44.5)]:
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
    custom("2,000 steps at 0.01 land on the formula's line", lands_on_formula, visible=True),
    custom("The slopes match slopes measured by nudging", matches_numerical,
           hint="If only this fails, check the 2 and the sign: the miss is prediction minus focus."),
    custom("One step from w = 0, b = 0", first_step,
           hint="If only this fails, start from w = 0 and b = 0, keep the loss before each step, then step."),
    custom("The loss goes down every step", loss_goes_down),
    custom("Points on y = 2x + 1", other_points),
    output("Prints the line found by descent", expect="By descent: focus = -0.1211 * temperature + 42.318", match="contains"),
    output("Tonight's setting at 4.0 degrees", expect="At 4.0 degrees, set the focus to 41.83 mm.", match="contains"),
    output("Tonight's setting at 9.5 degrees", set_vars={"TONIGHT": 9.5},
           expect="At 9.5 degrees, set the focus to 41.17 mm.", match="contains",
           hint="If only this fails, work the setting out from TONIGHT, not from 4.0 written in again."),
]
