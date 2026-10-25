import numpy as _np


def _module(ctx):
    mod = ctx.module()
    for name in ("distances", "forecast"):
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"analogue.py needs its {name} function.")
    return mod


def one_per_row(ctx):
    mod = _module(ctx)
    X = _np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 1.0]])
    got = mod.distances(X, _np.array([0.0, 0.0]))
    got = _np.asarray(got, dtype=float)
    if got.shape != (3,) or not _np.allclose(got, [0.0, 5.0, 2 ** 0.5]):
        raise CheckFailed("Three nights, so three distances: one for each row of X.",
                          expected=[0.0, 5.0, 1.414], actual=_np.round(got, 3).tolist())


def more_rows_than_columns(ctx):
    mod = _module(ctx)
    X = _np.array([[1.0, 2.0, 2.0], [0.0, 0.0, 0.0], [2.0, 0.0, 0.0], [0.0, 3.0, 4.0], [1.0, 1.0, 1.0]])
    got = _np.asarray(mod.distances(X, _np.array([0.0, 0.0, 0.0])), dtype=float)
    if got.shape != (5,) or not _np.allclose(got, [3.0, 0.0, 2.0, 5.0, 3 ** 0.5]):
        raise CheckFailed("Five nights of three readings each: five distances.",
                          expected=[3.0, 0.0, 2.0, 5.0, 1.732], actual=_np.round(got, 3).tolist())


def own_label(ctx):
    mod = _module(ctx)
    for row in [0, 7, 40, 101]:
        got = mod.forecast(mod.X_train[row], k=1)
        if got != mod.sky_train[row]:
            raise CheckFailed(f"With k = 1, a training night's nearest night is itself, so its forecast is its own sky.",
                              expected=str(mod.sky_train[row]), actual=str(got))


TESTS = [
    output("Validation accuracy", expect="Validation accuracy: 0.75", match="contains", visible=True),
    custom("distances gives one distance per night", one_per_row, visible=True),
    custom("Five nights, three readings", more_rows_than_columns,
           hint="If only this fails, add up along each row: axis=1 runs across the readings of one night."),
    output("All three skies get forecast", expect="Forecasts: 34 clear, 18 cloud, 8 fog", match="contains"),
    custom("A training night with k = 1", own_label),
]
