FUNCTIONS = ["to_bearings", "prevailing", "steadiness", "angle_between", "along_and_across"]


def january(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["vane.csv"]), delimiter=",", skiprows=1, usecols=(1, 2))
    bearings, speeds = data[:, 0], data[:, 1]
    angles = np.radians(bearings)
    arrows = np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])
    return bearings, speeds, arrows


def arrows_from(bearings, speeds):
    import numpy as np

    angles = np.radians(np.array(bearings, dtype=float))
    speeds = np.array(speeds, dtype=float)
    return np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])


def number(actual, what):
    import numpy as np

    if isinstance(actual, bool) or not isinstance(actual, (int, float, np.integer, np.floating)):
        raise CheckFailed(f"{what} should give back a number.", actual=repr(actual))
    if np.isnan(actual):
        raise CheckFailed(f"{what} came out as nan, not a number.", actual="nan")
    return float(actual)


def bearing_gap(a, b):
    """How far apart two bearings are, the short way round: 359 and 1 are 2 apart."""
    gap = abs(a - b) % 360
    return min(gap, 360 - gap)


def same_bearing(actual, expected, what, tol=0.01):
    value = number(actual, what)
    if not 0 <= value <= 360:
        raise CheckFailed(f"{what} should be a bearing from 0 up to 360.", expected=round(expected, 2), actual=round(value, 2))
    if bearing_gap(value, expected) > tol:
        raise CheckFailed(f"{what} points the wrong way.", expected=round(expected, 2), actual=round(value, 2))


def close(actual, expected, what, tol=1e-6):
    value = number(actual, what)
    if abs(value - expected) > tol:
        raise CheckFailed(f"{what} is out.", expected=round(expected, 4), actual=round(value, 4))


def pair(result, what):
    if not isinstance(result, (tuple, list)) or len(result) != 2:
        raise CheckFailed(f"{what} should give back two numbers: the bearing, then the speed.", actual=repr(result))
    return result


def january_prevailing(ctx):
    bearings, speeds, arrows = january(ctx)
    bearing, speed = pair(ctx.module().prevailing(arrows), "prevailing(arrows)")
    same_bearing(bearing, 350.1241316, "The prevailing bearing for January")
    close(speed, 11.4430951, "The prevailing speed for January", tol=1e-4)


def four_points(ctx):
    import numpy as np

    arrows = np.array([[0.0, 5.0], [5.0, 0.0], [0.0, -5.0], [-5.0, 0.0]])
    got = ctx.module().to_bearings(arrows)
    if not isinstance(got, np.ndarray) or got.shape != (4,):
        raise CheckFailed("to_bearings should give back an array with one bearing per arrow.",
                          expected="shape (4,)", actual=repr(got))
    for value, want, name in zip(got, [0, 90, 180, 270], ["north", "east", "south", "west"]):
        same_bearing(value, want, f"The arrow from due {name}")


def january_bearings(ctx):
    import numpy as np

    bearings, speeds, arrows = january(ctx)
    got = ctx.module().to_bearings(arrows)
    if not isinstance(got, np.ndarray) or got.shape != bearings.shape:
        raise CheckFailed("to_bearings should give back one bearing per day.", expected=str(bearings.shape), actual=repr(getattr(got, "shape", got)))
    if (got < 0).any() or (got > 360).any():
        raise CheckFailed("Every bearing should be from 0 up to 360. Bearings to the west of north come out of arctan2 below 0.",
                          expected="0 <= bearing < 360", actual=str(np.round(got[(got < 0) | (got > 360)][:3], 1)))
    for value, want in zip(got, bearings):
        same_bearing(value, want, f"The arrow for bearing {want:.0f}")


def either_side_of_north(ctx):
    bearing, speed = pair(ctx.module().prevailing(arrows_from([350, 10], [10, 10])), "prevailing")
    same_bearing(bearing, 0.0, "Winds from 350 and from 010 average to")
    close(speed, 9.8480775, "Winds from 350 and from 010, both at 10 knots, average to a speed of")


def january_steadiness(ctx):
    bearings, speeds, arrows = january(ctx)
    close(ctx.module().steadiness(arrows), 0.8087915, "steadiness for January", tol=1e-5)


def steady_and_not(ctx):
    module = ctx.module()
    close(module.steadiness(arrows_from([270, 270, 270], [5, 12, 20])), 1.0,
          "Three westerlies of different strengths: their steadiness")
    close(module.steadiness(arrows_from([0, 180], [8, 8])), 0.0,
          "A northerly and a southerly of the same strength: their steadiness")


def angles(ctx):
    import numpy as np

    module = ctx.module()
    cases = [
        ([1.0, 0.0], [0.0, 1.0], 90.0),
        ([1.0, 0.0], [-3.0, 0.0], 180.0),
        ([2.0, 0.0], [5.0, 5.0], 45.0),
        ([3.0, 4.0], [-4.0, 3.0], 90.0),
    ]
    for a, b, want in cases:
        close(module.angle_between(np.array(a), np.array(b)), want, f"angle_between({a}, {b})")


def same_direction(ctx):
    import numpy as np

    module = ctx.module()
    for a, b in [([3.0, 4.0], [6.0, 8.0]), ([1.0, 1.0], [7.0, 7.0]), ([0.1, 0.7], [0.3, 2.1])]:
        close(module.angle_between(np.array(a), np.array(b)), 0.0, f"angle_between({a}, {b})", tol=1e-4)


def frame_check(got, want, what):
    import numpy as np

    if not isinstance(got, np.ndarray) or got.shape != want.shape:
        raise CheckFailed(f"{what} should give back one row per wind, two numbers each.",
                          expected=str(want.shape), actual=repr(getattr(got, "shape", got)))
    if not np.allclose(got, want, atol=1e-6):
        raise CheckFailed(f"{what} has the right shape but the wrong numbers.",
                          expected=str(np.round(want, 2)[:3].tolist()), actual=str(np.round(got, 2)[:3].tolist()))


def due_north(ctx):
    import numpy as np

    module = ctx.module()
    wind = np.array([[0.0, 10.0]])
    frame_check(module.along_and_across(wind, 0), np.array([[10.0, 0.0]]),
                "A 10-knot northerly, for a boat heading north,")
    frame_check(module.along_and_across(wind, 90), np.array([[0.0, -10.0]]),
                "A 10-knot northerly, for a boat heading east,")


def ferry_january(ctx):
    import numpy as np

    bearings, speeds, arrows = january(ctx)
    angle = np.radians(40)
    want = np.column_stack([arrows @ [np.sin(angle), np.cos(angle)], arrows @ [np.cos(angle), -np.sin(angle)]])
    frame_check(ctx.module().along_and_across(arrows, 40), want, "along_and_across(arrows, 40) for January")


def other_headings(ctx):
    import numpy as np

    arrows = arrows_from([0, 90, 225, 300], [10, 6, 8, 12])
    module = ctx.module()
    for heading in [180, 225, 310]:
        angle = np.radians(heading)
        want = np.column_stack([arrows @ [np.sin(angle), np.cos(angle)], arrows @ [np.cos(angle), -np.sin(angle)]])
        frame_check(module.along_and_across(arrows, heading), want, f"along_and_across for a heading of {heading:03d}")


def no_loops(ctx):
    import ast

    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name in FUNCTIONS:
            for inner in ast.walk(node):
                if isinstance(inner, (ast.For, ast.While, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
                    raise CheckFailed(f"{node.name} has a loop in it. Each of these works on every arrow at once.")


def uses_a_matrix(ctx):
    import ast

    for node in ast.walk(ctx.tree):
        if isinstance(node, ast.FunctionDef) and node.name == "along_and_across":
            for inner in ast.walk(node):
                if isinstance(inner, ast.BinOp) and isinstance(inner.op, ast.MatMult):
                    return
                if isinstance(inner, ast.Call) and getattr(inner.func, "attr", getattr(inner.func, "id", "")) in ("dot", "matmul"):
                    return
            raise CheckFailed("along_and_across should move the arrows with @ (or np.dot), not by working out each part by hand.")
    raise CheckFailed("main.py needs a function called along_and_across.")


TESTS = [
    custom("January's prevailing wind", january_prevailing, visible=True),
    custom("Bearings for north, east, south and west", four_points, visible=True),
    custom("Every January bearing, back again", january_bearings,
           hint="np.arctan2 gives angles from -180 to 180 degrees. % 360 turns the negative ones into bearings west of north."),
    custom("Winds either side of north", either_side_of_north,
           hint="Average the arrows, then find the bearing of the average. Never average the bearings themselves."),
    custom("January's steadiness", january_steadiness),
    custom("Steady and not at all steady", steady_and_not,
           hint="The mean speed is the mean of every arrow's length: np.linalg.norm(arrows, axis=1).mean()."),
    custom("Angles between arrows", angles),
    custom("Arrows pointing the same way", same_direction,
           hint="If you get nan, the cosine came out a hair over 1 from rounding. np.clip(cosine, -1, 1) keeps it in range."),
    custom("A northerly, heading north and heading east", due_north,
           hint="Ahead is the one-knot arrow for the heading. Starboard is a quarter turn clockwise from it: (cos, -sin) of the heading."),
    custom("The ferry's January", ferry_january),
    custom("Other headings", other_headings),
    custom("No loops", no_loops, hint="Each function is array arithmetic on every arrow at once. No for, no while."),
    custom("A matrix moves the arrows", uses_a_matrix),
]
