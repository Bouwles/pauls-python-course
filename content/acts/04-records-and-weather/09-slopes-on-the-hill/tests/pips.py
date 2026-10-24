def squared(x):
    return x ** 2


def line(x):
    return 3 * x + 1


def cubed(x):
    return x ** 3


def close(actual, expected, what, tol=1e-4):
    if isinstance(actual, bool) or not isinstance(actual, (int, float)):
        raise CheckFailed(f"{what} should be a number.", actual=repr(actual))
    if abs(actual - expected) > tol:
        raise CheckFailed(f"{what} is out.", expected=round(expected, 4), actual=round(actual, 4))


def curve(ctx):
    close(ctx.module().slope(squared, 3.0), 6.0, "The slope of x ** 2 at 3")


def stile(ctx):
    module = ctx.module()
    close(module.slope(module.path_height, 650), 0.2426123, "The slope of the path at the stile", tol=1e-5)


def straight(ctx):
    module = ctx.module()
    close(module.slope(line, -2.0), 3.0, "The slope of 3 * x + 1")
    close(module.slope(cubed, 1.0, step=0.1), 3.01, "The slope of x ** 3 at 1, measured 0.1 either side")


TESTS = [
    custom("The slope of x squared", curve, visible=True),
    custom("The stile", stile, visible=True),
    custom("A straight line, and a bigger step", straight,
           hint="Nudging up and nudging down puts the two points 2 * step apart. That's the run to divide by."),
]
