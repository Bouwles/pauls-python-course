def arrows_from(bearings, speeds):
    import numpy as np

    angles = np.radians(np.array(bearings, dtype=float))
    speeds = np.array(speeds, dtype=float)
    return np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])


def january(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["vane.csv"]), delimiter=",", skiprows=1, usecols=(1, 2))
    got = ctx.module().strongest_quarter(arrows_from(data[:, 0], data[:, 1]))
    if got != "west":
        raise CheckFailed("In January the westerlies were few, but strong.", expected="'west'", actual=repr(got))


def either_side_of_north(ctx):
    got = ctx.module().strongest_quarter(arrows_from([350, 20, 100, 170], [30, 30, 10, 12]))
    if got != "north":
        raise CheckFailed("Winds from 350 and 020 are both in the north quarter.", expected="'north'", actual=repr(got))


TESTS = [
    custom("January", january, visible=True),
    custom("Either side of north", either_side_of_north),
]
