def same_arrows(actual, expected, what):
    import numpy as np

    if not isinstance(actual, np.ndarray):
        raise CheckFailed(f"{what} should give back an array.", actual=type(actual).__name__)
    if actual.shape != expected.shape:
        raise CheckFailed(f"{what} gives back the wrong shape.", expected=str(expected.shape), actual=str(actual.shape))
    if not np.allclose(actual, expected, atol=1e-6):
        raise CheckFailed(f"{what} points the wrong way.",
                          expected=str(np.round(expected, 1)[:4].tolist()), actual=str(np.round(actual, 1)[:4].tolist()))


def compass(ctx):
    import numpy as np

    got = ctx.module().to_arrows(np.array([0, 90, 180, 270]), np.array([10, 10, 10, 10]))
    want = np.array([[0.0, 10.0], [10.0, 0.0], [0.0, -10.0], [-10.0, 0.0]])
    same_arrows(got, want, "North, east, south and west at 10 knots")


def january(ctx):
    import io

    import numpy as np

    data = np.loadtxt(io.StringIO(ctx.files["vane.csv"]), delimiter=",", skiprows=1, usecols=(1, 2))
    angles = np.radians(data[:, 0])
    want = np.column_stack([data[:, 1] * np.sin(angles), data[:, 1] * np.cos(angles)])
    same_arrows(ctx.module().to_arrows(data[:, 0], data[:, 1]), want, "January's arrows")


def in_between(ctx):
    import numpy as np

    got = ctx.module().to_arrows(np.array([45.0, 300.0]), np.array([4.0, 6.0]))
    want = np.array([[2.8284271, 2.8284271], [-5.1961524, 3.0]])
    same_arrows(got, want, "A north-easterly at 4 knots and a wind from 300 at 6 knots")


TESTS = [
    custom("North, east, south and west", compass, visible=True),
    custom("Thirty-one days of January", january, visible=True),
    custom("Bearings in between", in_between,
           hint="np.sin and np.cos measure angles in radians. np.radians turns degrees into radians first."),
]
