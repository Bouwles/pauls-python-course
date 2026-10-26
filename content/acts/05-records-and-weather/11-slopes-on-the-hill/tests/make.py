import math


def squared(x):
    return x ** 2


def cubed(x):
    return x ** 3


def plane(east, north):
    return 3 * east + 4 * north + 7


def product(east, north):
    return east * north


def falling_north(east, north):
    return 50 - north


def survey(east, north):
    return 140 * math.exp(-((east / 500) ** 2 + ((north - 1000) / 350) ** 2) / 2)


def survey_slopes(east, north):
    """The hill's two slopes, worked out by hand, to check against."""
    height = survey(east, north)
    return -height * east / 500 ** 2, -height * (north - 1000) / 350 ** 2


def number(actual, what):
    import numbers

    if isinstance(actual, bool) or not isinstance(actual, numbers.Real):
        raise CheckFailed(f"{what} should be a number.", actual=repr(actual))
    if math.isnan(actual):
        raise CheckFailed(f"{what} came out as nan.", actual="nan")
    return float(actual)


def close(actual, expected, what, tol=1e-4):
    value = number(actual, what)
    if abs(value - expected) > tol:
        raise CheckFailed(f"{what} is out.", expected=round(expected, 4), actual=round(value, 4))


def two(result, what, names):
    if not isinstance(result, (tuple, list)) or len(result) != 2:
        raise CheckFailed(f"{what} should give back two numbers: {names}.", actual=repr(result))
    return result


def curve_and_path(ctx):
    module = ctx.module()
    close(module.slope(squared, 3.0), 6.0, "slope(x ** 2) at 3")
    close(module.slope(module.path_height, 650), 0.2426123, "The path's slope at the stile", tol=1e-5)


def hill_slopes(ctx):
    module = ctx.module()
    east_slope, north_slope = two(module.partial_slopes(survey, 300.0, 600.0), "partial_slopes", "the east slope, then the north slope")
    want_east, want_north = survey_slopes(300.0, 600.0)
    close(east_slope, want_east, "The east slope at the gorse", tol=1e-5)
    close(north_slope, want_north, "The north slope at the gorse", tol=1e-5)


def both_ways(ctx):
    close(ctx.module().slope(cubed, 1.0, step=0.1), 3.01, "slope(x ** 3) at 1, a step of 0.1 either side", tol=1e-9)


def other_functions(ctx):
    module = ctx.module()
    close(module.slope(lambda x: 1 / x, 2.0), -0.25, "slope(1 / x) at 2")
    close(module.slope(lambda x: 5 - 2 * x, 100.0), -2.0, "slope(5 - 2 * x) at 100")


def one_at_a_time(ctx):
    module = ctx.module()
    east_slope, north_slope = two(module.partial_slopes(product, 2.0, 5.0), "partial_slopes", "the east slope, then the north slope")
    close(east_slope, 5.0, "The east slope of east * north at (2, 5)")
    close(north_slope, 2.0, "The north slope of east * north at (2, 5)")


def flat_plane(ctx):
    module = ctx.module()
    east_slope, north_slope = two(module.partial_slopes(plane, -40.0, 12.0), "partial_slopes", "the east slope, then the north slope")
    close(east_slope, 3.0, "The east slope of a plane rising 3 a metre eastwards")
    close(north_slope, 4.0, "The north slope of a plane rising 4 a metre northwards")


def the_top(ctx):
    module = ctx.module()
    east_slope, north_slope = two(module.partial_slopes(survey, 0.0, 1000.0), "partial_slopes", "the east slope, then the north slope")
    close(east_slope, 0.0, "The east slope on top of the hill", tol=1e-6)
    close(north_slope, 0.0, "The north slope on top of the hill", tol=1e-6)


def bearing_gap(a, b):
    gap = abs(a - b) % 360
    return min(gap, 360 - gap)


def same_bearing(actual, expected, what, tol=0.01):
    value = number(actual, what)
    if not 0 <= value <= 360 or bearing_gap(value, expected) > tol:
        raise CheckFailed(f"{what} points the wrong way.", expected=round(expected, 2), actual=round(value, 2))


def gorse(ctx):
    bearing, steepness = two(ctx.module().uphill(survey, 300.0, 600.0), "uphill", "the bearing, then the steepness")
    want_east, want_north = survey_slopes(300.0, 600.0)
    same_bearing(bearing, math.degrees(math.atan2(want_east, want_north)) % 360, "Straight uphill from the gorse")
    close(steepness, math.hypot(want_east, want_north), "The steepness at the gorse", tol=1e-5)


def planes(ctx):
    module = ctx.module()
    bearing, steepness = two(module.uphill(plane, 0.0, 0.0), "uphill", "the bearing, then the steepness")
    same_bearing(bearing, 36.8699, "Uphill on a plane rising 3 east and 4 north")
    close(steepness, 5.0, "The steepness of a plane rising 3 east and 4 north")
    bearing, steepness = two(module.uphill(falling_north, 10.0, 10.0), "uphill", "the bearing, then the steepness")
    same_bearing(bearing, 180.0, "Uphill on ground that falls away to the north")
    close(steepness, 1.0, "The steepness of ground falling 1 a metre northwards")


def thermometer(ctx):
    gain_slope, offset_slope = two(ctx.module().miss_slopes(1.0, 0.0, 8.5, 10.0), "miss_slopes", "the gain slope, then the offset slope")
    close(gain_slope, -25.5, "The gain slope for a reading of 8.5 that should be 10", tol=1e-9)
    close(offset_slope, -3.0, "The offset slope for a reading of 8.5 that should be 10", tol=1e-9)


def against_measured(ctx):
    module = ctx.module()
    step = 1e-5
    for gain, offset, reading, true in [(1.2, -0.5, 4.0, 3.0), (0.9, 2.0, -6.0, -3.5), (1.0, 1.5, 12.0, 13.5)]:
        def miss(g, o):
            return (g * reading + o - true) ** 2

        want_gain = (miss(gain + step, offset) - miss(gain - step, offset)) / (2 * step)
        want_offset = (miss(gain, offset + step) - miss(gain, offset - step)) / (2 * step)
        gain_slope, offset_slope = two(module.miss_slopes(gain, offset, reading, true), "miss_slopes", "the gain slope, then the offset slope")
        what = f"miss_slopes({gain}, {offset}, {reading}, {true})"
        close(gain_slope, want_gain, f"The gain slope from {what}", tol=1e-4)
        close(offset_slope, want_offset, f"The offset slope from {what}", tol=1e-4)


def worked_out(ctx):
    import ast

    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name == "miss_slopes":
            for inner in ast.walk(node):
                if isinstance(inner, ast.Call) and getattr(inner.func, "id", None) in ("slope", "partial_slopes"):
                    raise CheckFailed("miss_slopes should work the slopes out with the chain rule, not measure them. The checks do the measuring.")
            return
    raise CheckFailed("main.py needs a function called miss_slopes.")


TESTS = [
    custom("A curve, and the path at the stile", curve_and_path, visible=True),
    custom("The hill's two slopes at the gorse", hill_slopes, visible=True),
    custom("A step either side", both_ways,
           hint="Use the step you're given, both ways: f(x + step) and f(x - step), divided by 2 * step."),
    custom("Other curves", other_functions),
    custom("One input at a time", one_at_a_time,
           hint="For the east slope, nudge east and leave north exactly as it is. Then the other way round."),
    custom("A sloping plane", flat_plane),
    custom("On top of the hill", the_top),
    custom("Uphill from the gorse", gorse,
           hint="The two slopes make an arrow, (east, north), that points straight uphill. Its bearing is math.atan2(east, north), in degrees, % 360."),
    custom("Uphill on two planes", planes),
    custom("The thermometer on the hill", thermometer, visible=True),
    custom("Worked-out slopes against measured ones", against_measured,
           hint="The square's slope is 2 * miss. The miss grows by reading for each unit of gain, and by 1 for each unit of offset. Multiply."),
    custom("Worked out, not measured", worked_out),
]
