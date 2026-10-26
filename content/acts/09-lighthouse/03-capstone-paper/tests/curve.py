import numpy as _np

_FEATURES = 10


def _true_answer(X):
    return _np.tanh(2 * X.sum(axis=1) / _np.sqrt(_FEATURES))


def _reference(width, seed, n_train=40, noise=0.2, n_test=400):
    rng = _np.random.default_rng(seed)
    X_train = rng.normal(size=(n_train, _FEATURES))
    y_train = _true_answer(X_train) + rng.normal(0, noise, n_train)
    X_test = rng.normal(size=(n_test, _FEATURES))
    y_test = _true_answer(X_test)
    W = rng.normal(size=(_FEATURES, width)) / _np.sqrt(_FEATURES)
    train, test = _np.maximum(0, X_train @ W), _np.maximum(0, X_test @ W)
    weights = _np.linalg.pinv(train) @ y_train
    return float(_np.mean((train @ weights - y_train) ** 2)), float(_np.mean((test @ weights - y_test) ** 2))


def _module(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"reproduce.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _errors(result, what):
    try:
        train_error, test_error = result
        return float(train_error), float(test_error)
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should give back two numbers: (train_error, test_error).", actual=repr(result)[:200])


def _close(got, want, message, call):
    if not (abs(got[0] - want[0]) <= 1e-6 * max(1.0, abs(want[0])) and abs(got[1] - want[1]) <= 1e-6 * max(1.0, abs(want[1]))):
        raise CheckFailed(message, expected=f"{call} = ({want[0]:.6f}, {want[1]:.6f})", actual=f"({got[0]:.6f}, {got[1]:.6f})")


def wendts_numbers(ctx):
    mod = _module(ctx, "run_once")
    got = _errors(mod.run_once(15, 3), "run_once")
    _close(got, _reference(15, 3), "Draw from default_rng(seed) in exactly the agreed order, and the numbers will match.", "run_once(15, 3)")


def zero_training_error(ctx):
    mod = _module(ctx, "run_once")
    for width in (40, 100):
        train_error, _ = _errors(mod.run_once(width, 0), "run_once")
        if not train_error < 1e-12:
            raise CheckFailed(f"With {width} features and 40 examples, the fit goes through every training example.",
                              expected="a training error of 0 (under 1e-12)", actual=train_error)


def same_seed(ctx):
    mod = _module(ctx, "run_once")
    first, again, other = (_errors(mod.run_once(25, seed), "run_once") for seed in (7, 7, 8))
    if first != again:
        raise CheckFailed("The same seed should give exactly the same errors every time.", expected=str(first), actual=str(again))
    if first == other:
        raise CheckFailed("A different seed should draw different data and different features.")


def other_settings(ctx):
    mod = _module(ctx, "run_once")
    got = _errors(mod.run_once(30, 5, n_train=25, noise=0.0, n_test=100), "run_once")
    _close(got, _reference(30, 5, n_train=25, noise=0.0, n_test=100),
           "n_train, noise and n_test should all change the trial.", "run_once(30, 5, n_train=25, noise=0.0, n_test=100)")


def _curve(mod, widths, seeds, **settings):
    got = mod.descent_curve(widths, seeds, **settings)
    if got is None or len(got) != len(widths):
        raise CheckFailed("descent_curve should give back a list with one number for each width.",
                          expected=f"a list of {len(widths)}", actual=repr(got)[:200])
    return [float(value) for value in got]


def medians(ctx):
    mod = _module(ctx, "run_once", "descent_curve")
    widths, seeds = [10, 40, 200], range(5)
    got = _curve(mod, widths, seeds)
    want = [float(_np.median([_errors(mod.run_once(width, seed), "run_once")[1] for seed in seeds])) for width in widths]
    if not _np.allclose(got, want, rtol=1e-9):
        raise CheckFailed("For each width, the median of the test errors over the seeds.",
                          expected=[round(v, 4) for v in want], actual=[round(v, 4) for v in got])


def shape(ctx):
    mod = _module(ctx, "run_once", "descent_curve")
    few, best, peak, many = _curve(mod, [2, 15, 40, 1000], range(20, 25))
    if not best < few:
        raise CheckFailed("From 2 features to 15, the test error should fall.", expected=f"under {few:.3f}", actual=f"{best:.3f}")
    if not peak > 5 * best:
        raise CheckFailed("At 40 features, one per training example, the test error should shoot up.", expected=f"over {5 * best:.3f}", actual=f"{peak:.3f}")
    if not many < best:
        raise CheckFailed("At 1000 features it should come down again, below the bottom of the first dip.", expected=f"under {best:.3f}", actual=f"{many:.3f}")


def peak_moves(ctx):
    mod = _module(ctx, "run_once", "descent_curve")
    before, peak, after = _curve(mod, [8, 20, 500], range(20, 25), n_train=20)
    if not (peak > 3 * before and peak > 3 * after):
        raise CheckFailed("With 20 training examples, the peak should be at 20 features.",
                          expected="the middle number far above the others", actual=f"{before:.3f}, {peak:.3f}, {after:.3f}")


TESTS = [
    custom("run_once(15, 3) matches Professor Wendt's numbers", wendts_numbers, visible=True),
    custom("From 40 features up, the training error is 0", zero_training_error, visible=True),
    custom("Same seed, same errors; another seed, others", same_seed),
    custom("n_train, noise and n_test are passed on", other_settings,
           hint="If only this fails, check that every argument of run_once is used, not the defaults."),
    custom("descent_curve takes the median over the seeds", medians,
           hint="If only this fails: the median, not the mean. Near the peak one seed can be a thousand times worse than the rest."),
    custom("Down, up at 40, and down again", shape),
    custom("With 20 training examples, the peak moves to 20", peak_moves,
           hint="If only this fails, pass n_train on to run_once."),
]
