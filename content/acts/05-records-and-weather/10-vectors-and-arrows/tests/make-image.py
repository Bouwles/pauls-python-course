SMALL = [[0.0, 50.0, 100.0],
         [150.0, 200.0, 250.0]]


def the_image(ctx):
    import io

    import numpy as np

    return np.loadtxt(io.StringIO(ctx.files["lighthouse.csv"]), delimiter=",")


def same(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.allclose(actual, expected):
        raise CheckFailed(f"{what} has the right shape but the wrong numbers.",
                          expected=str(np.round(expected, 1).ravel()[:6]), actual=str(np.round(actual, 1).ravel()[:6]))


def flips(ctx):
    import numpy as np

    module = ctx.module()
    small = np.array(SMALL)
    same(module.mirror(small), np.array([[100.0, 50.0, 0.0], [250.0, 200.0, 150.0]]), "mirror")
    same(module.upside_down(small), np.array([[150.0, 200.0, 250.0], [0.0, 50.0, 100.0]]), "upside_down")


def turned(ctx):
    import numpy as np

    module = ctx.module()
    small = np.array(SMALL)
    same(module.quarter_turn(small), np.array([[150.0, 0.0], [200.0, 50.0], [250.0, 100.0]]), "quarter_turn on a small picture")
    image = the_image(ctx)
    same(module.quarter_turn(image), np.rot90(image, -1), "quarter_turn on the lighthouse")


def four_turns(ctx):
    import numpy as np

    module = ctx.module()
    image = the_image(ctx)
    turned = image
    for _ in range(4):
        turned = module.quarter_turn(turned)
    same(turned, image, "Four quarter turns")


def brighter(ctx):
    import numpy as np

    module = ctx.module()
    small = np.array(SMALL)
    same(module.brighten(small, 60), np.array([[60.0, 110.0, 160.0], [210.0, 255.0, 255.0]]), "brighten by 60")
    same(module.brighten(small, -60), np.array([[0.0, 0.0, 40.0], [90.0, 140.0, 190.0]]), "brighten by -60")


def left_alone(ctx):
    import numpy as np

    module = ctx.module()
    image = the_image(ctx)
    before = image.copy()
    module.brighten(image, 40)
    module.blur(image)
    module.mirror(image).copy()
    if not np.array_equal(image, before):
        raise CheckFailed("The photograph changed. Each function should give back a new picture and leave the one it was given alone.")


def blurred(ctx):
    import numpy as np

    module = ctx.module()
    small = np.array([[0.0, 90.0, 0.0], [90.0, 0.0, 90.0], [0.0, 90.0, 0.0]])
    expected = np.full((3, 3), 40.0)
    same(module.blur(small), expected, "blur on a small chequered picture, which comes out an even grey")


def blurred_lighthouse(ctx):
    import numpy as np

    image = the_image(ctx)
    padded = np.pad(image, 1, mode="edge")
    expected = sum(padded[down:down + image.shape[0], across:across + image.shape[1]] for down in range(3) for across in range(3)) / 9
    same(ctx.module().blur(image), expected, "blur on the lighthouse")


def turns(ctx):
    import numpy as np

    module = ctx.module()
    quarter = module.rotation(90)
    if not isinstance(quarter, np.ndarray) or quarter.shape != (2, 2):
        raise CheckFailed("rotation should give back a 2 by 2 array.", actual=repr(quarter))
    if not np.allclose(quarter @ np.array([1.0, 0.0]), [0.0, 1.0]):
        raise CheckFailed("A quarter turn anticlockwise takes the arrow (1, 0), pointing east, to (0, 1), pointing north.",
                          expected="[0. 1.]", actual=str((quarter @ np.array([1.0, 0.0])).round(3)))


def back_again(ctx):
    import numpy as np

    module = ctx.module()
    if not np.allclose(module.rotation(35) @ module.rotation(-35), np.eye(2)):
        raise CheckFailed("Turning 35 degrees one way, then 35 the other, should leave everything where it was: the identity matrix.")
    if not np.allclose(module.rotation(30) @ module.rotation(60), module.rotation(90)):
        raise CheckFailed("Two turns, one after the other, multiply: rotation(30) @ rotation(60) is rotation(90).")


def points_turned(ctx):
    import numpy as np

    module = ctx.module()
    points = np.array([[2.0, 0.0], [0.0, 3.0], [1.0, 1.0]])
    expected = np.array([[0.0, 2.0], [-3.0, 0.0], [-1.0, 1.0]])
    same(module.turn_points(points, 90), expected, "turn_points by 90 degrees")
    same(module.turn_points(points, 0), points, "turn_points by 0 degrees")


def uses_matrix(tree, source):
    import ast

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == "turn_points":
            if not any(isinstance(inner, ast.BinOp) and isinstance(inner.op, ast.MatMult) for inner in ast.walk(node)):
                return "Turn the points by multiplying them by the rotation matrix, with @."
            return None
    return "Define a function called turn_points."


OUTPUT = """Cape Lookout: 64 rows by 48 columns, brightness 0 to 229
Turned a quarter: 48 rows by 64 columns
Brightened by 60: average 211.2, against 154.5
Blurred: brightness 8 to 226
House turned 30 degrees and back: True
Roof, turned 90 degrees: [-12.  10.]"""

TESTS = [
    custom("Mirrored and upside down", flips, visible=True,
           hint="Slicing with ::-1 reverses: image[::-1] reverses the rows, image[:, ::-1] reverses each row."),
    output("The lighthouse, worked on", expect=OUTPUT, visible=True),
    custom("A quarter turn", turned,
           hint="Turn it upside down, then swap rows and columns with .T. Try it on a 2 by 3 picture on paper first."),
    custom("Four quarter turns", four_turns),
    custom("Brighter and darker", brighter, hint="Add the amount, then np.clip(..., 0, 255): nothing whiter than white, nothing blacker than black."),
    custom("The photograph left alone", left_alone),
    custom("A small picture blurred", blurred,
           hint="np.pad(image, 1, mode=\"edge\") puts a border round it that repeats the edge, so every pixel has eight neighbours. Then add the nine shifted slices and divide by 9."),
    custom("The lighthouse blurred", blurred_lighthouse),
    custom("A quarter turn of an arrow", turns, hint="[[cos, -sin], [sin, cos]], with the angle in radians: np.radians(degrees)."),
    custom("There and back, and two turns in one", back_again),
    custom("Turning points", points_turned,
           hint="With one point per row, points @ rotation(degrees).T turns every row at once."),
    structure("Turned by a matrix", check=uses_matrix),
]
