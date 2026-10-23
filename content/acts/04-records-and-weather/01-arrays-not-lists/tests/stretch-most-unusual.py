def century(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["rainfall.csv"]), delimiter=",", skiprows=1)
    return data[:, 0].astype(int), data[:, 1:]


def storm(ctx):
    years, rain = century(ctx)
    result = ctx.module().most_unusual(years, rain)
    if tuple(int(x) for x in result) != (1987, 10):
        raise CheckFailed("The most unusual month in Ashby's century is October 1987.", expected="(1987, 10)", actual=repr(result))


def dry_spell(ctx):
    import numpy as np

    years = np.array([1975, 1976, 1977])
    rain = np.full((3, 12), 80.0)
    rain[1, 7] = 2.0
    rain[2, 0] = 120.0
    result = ctx.module().most_unusual(years, rain)
    if tuple(int(x) for x in result) != (1976, 8):
        raise CheckFailed("A month far drier than normal counts too. Here it's August 1976.", expected="(1976, 8)", actual=repr(result))


TESTS = [
    custom("The storm of '87", storm, visible=True),
    custom("A very dry August", dry_spell),
]
