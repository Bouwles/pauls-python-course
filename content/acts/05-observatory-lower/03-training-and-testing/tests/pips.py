import numpy as _np


def _features(x, degree):
    return _np.column_stack([x ** power for power in range(degree + 1)])


def _best_on_validation(x_train, y_train, x_val, y_val, degrees):
    errors = []
    for degree in degrees:
        weights = _np.linalg.lstsq(_features(x_train, degree), y_train, rcond=None)[0]
        errors.append(_np.mean((_features(x_val, degree) @ weights - y_val) ** 2))
    return degrees[int(_np.argmin(errors))]


def _check_choice(ctx, x_train, y_train, x_val, y_val, degrees, what):
    mod = ctx.module()
    if not callable(getattr(mod, "choose_degree", None)):
        raise CheckFailed("curve.py needs its choose_degree function.")
    want = _best_on_validation(x_train, y_train, x_val, y_val, degrees)
    got = mod.choose_degree(x_train, y_train, x_val, y_val, degrees)
    if got != want:
        raise CheckFailed(f"{what} The degree with the lowest error on the validation readings is {want}.",
                          expected=want, actual=got)


def _line(ctx, start, want, why):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    lines = [line.strip() for line in result.output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=result.output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def chosen(ctx):
    _line(ctx, "Chosen degree:", "Chosen degree: 2",
          "Choose by the error on Wednesday's readings, which the curve was never fitted to.")


def wednesday_error(ctx):
    _line(ctx, "Error on Wednesday:", "Error on Wednesday: 0.0955", "Wednesday's error for the chosen degree is off.")


def quadratic(ctx):
    rng = _np.random.default_rng(1)
    x_train = _np.linspace(0, 1, 8)
    x_val = _np.linspace(0.05, 0.95, 8)
    y_train = 1 + 2 * x_train - 3 * x_train ** 2 + rng.normal(0, 0.05, 8)
    y_val = 1 + 2 * x_val - 3 * x_val ** 2 + rng.normal(0, 0.05, 8)
    _check_choice(ctx, x_train, y_train, x_val, y_val, [1, 2, 3, 4, 5, 6],
                  "Degree 6 fits the training points best, but that isn't the question.")


def odd_degrees(ctx):
    rng = _np.random.default_rng(2)
    x_train = _np.linspace(0, 2, 10)
    x_val = _np.linspace(0.1, 1.9, 10)
    y_train = _np.sin(3 * x_train) + rng.normal(0, 0.05, 10)
    y_val = _np.sin(3 * x_val) + rng.normal(0, 0.05, 10)
    _check_choice(ctx, x_train, y_train, x_val, y_val, [1, 3, 5, 7, 9], "Only odd degrees this time.")


TESTS = [
    custom("Tuesday to learn, Wednesday to choose: degree 2", chosen, visible=True),
    custom("choose_degree picks by validation error", quadratic, visible=True),
    custom("Degrees 1, 3, 5, 7 and 9", odd_degrees,
           hint="If only this fails, give back the degree from the list, not its position in the list."),
    custom("Wednesday's error, honestly measured", wednesday_error),
]
