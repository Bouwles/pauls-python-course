def penhallows_hill(ctx):
    module = ctx.module()
    got = module.steepest_point(module.hill_height, 1000, 50)
    if got is None or tuple(float(v) for v in got) != (0.0, 650.0):
        raise CheckFailed("On Penhallow's hill, the steepest ground on the grid is at the stile.", expected="(0, 650)", actual=repr(got))


def a_ridge(ctx):
    def ridge(east, north):
        return 20 - abs(east - 30) * 0.5 - (north - 40) ** 2 * 0.001

    got = ctx.module().steepest_point(ridge, 100, 20)
    if got is None or float(got[1]) != 100.0:
        raise CheckFailed("On this ridge the ground is steepest at the far north edge of the grid.", expected="north = 100", actual=repr(got))


TESTS = [
    custom("Penhallow's hill", penhallows_hill, visible=True),
    custom("A ridge", a_ridge),
]
