import numpy as _np


def _module(ctx):
    mod = ctx.module()
    for name in ("distances", "identify"):
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"identify.py needs its {name} function.")
    return mod


def one_per_row(ctx):
    mod = _module(ctx)
    X = _np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 1.0]])
    got = mod.distances(X, _np.array([0.0, 0.0]))
    got = _np.asarray(got, dtype=float)
    if got.shape != (3,) or not _np.allclose(got, [0.0, 5.0, 2 ** 0.5]):
        raise CheckFailed("Three penguins, so three distances: one for each row of X.",
                          expected=[0.0, 5.0, 1.414], actual=_np.round(got, 3).tolist())


def more_rows_than_columns(ctx):
    mod = _module(ctx)
    X = _np.array([[1.0, 2.0, 2.0], [0.0, 0.0, 0.0], [2.0, 0.0, 0.0], [0.0, 3.0, 4.0], [1.0, 1.0, 1.0]])
    got = _np.asarray(mod.distances(X, _np.array([0.0, 0.0, 0.0])), dtype=float)
    if got.shape != (5,) or not _np.allclose(got, [3.0, 0.0, 2.0, 5.0, 3 ** 0.5]):
        raise CheckFailed("Five animals of three measurements each: five distances.",
                          expected=[3.0, 0.0, 2.0, 5.0, 1.732], actual=_np.round(got, 3).tolist())


def own_label(ctx):
    mod = _module(ctx)
    for row in [0, 7, 40, 101]:
        got = mod.identify(mod.X_train[row], k=1)
        twins = mod.species_train[(mod.X_train == mod.X_train[row]).all(axis=1)]
        if got not in set(twins):
            raise CheckFailed("With k = 1, a training penguin's nearest penguin is itself, or a twin with the same measurements.",
                              expected=str(mod.species_train[row]), actual=str(got))


TESTS = [
    output("Validation accuracy", expect="Validation accuracy: 0.79", match="contains", visible=True),
    custom("distances gives one distance per penguin", one_per_row, visible=True),
    custom("Five animals, three measurements", more_rows_than_columns,
           hint="If only this fails, add up along each row: axis=1 runs across the measurements of one animal."),
    output("All three species get named", expect="Answers: 48 Adelie, 6 Chinstrap, 32 Gentoo", match="contains"),
    custom("A training penguin with k = 1", own_label),
]
