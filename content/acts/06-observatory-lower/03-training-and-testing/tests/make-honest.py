import re as _re

import numpy as _np

NEEDED = ("train_test_split", "with_powers", "validation_curve", "choose_degree",
          "fit_scaler", "scale", "predict", "fit_closed_form")
FEATURES = ["first_term", "study_time", "failures", "going_out", "absences"]
TABLE = [
    (1, 2.124, 1.973), (2, 2.119, 1.947), (3, 2.118, 1.958), (4, 2.117, 1.970),
    (5, 2.117, 1.969), (6, 2.093, 2.663), (7, 2.066, 5.016), (8, 2.036, 32.619),
]


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"exam_scores.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _students():
    import pandas as _pd
    table = _pd.read_csv("students.csv")
    return table[FEATURES].to_numpy(dtype=float), table["final"].to_numpy(dtype=float)


def _powers(X, degree):
    return _np.column_stack([X] + [X[:, -1] ** p for p in range(2, degree + 1)])


def _errors(X_train, y_train, X_val, y_val, degrees):
    train_errors, val_errors = [], []
    for degree in degrees:
        wide_train, wide_val = _powers(X_train, degree), _powers(X_val, degree)
        means, spreads = wide_train.mean(axis=0), wide_train.std(axis=0)
        A = _np.column_stack([(wide_train - means) / spreads, _np.ones(len(wide_train))])
        weights = _np.linalg.lstsq(A, y_train, rcond=None)[0]
        B = _np.column_stack([(wide_val - means) / spreads, _np.ones(len(wide_val))])
        train_errors.append(_np.mean((A @ weights - y_train) ** 2))
        val_errors.append(_np.mean((B @ weights - y_val) ** 2))
    return train_errors, val_errors


def _split(mod, X, y, fraction, seed):
    result = mod.train_test_split(X, y, fraction, _np.random.default_rng(seed))
    if result is None:
        raise CheckFailed("train_test_split gave back None. It should return X_train, X_test, y_train, y_test.")
    try:
        X_train, X_test, y_train, y_test = result
    except (TypeError, ValueError):
        raise CheckFailed("train_test_split should return four arrays: X_train, X_test, y_train, y_test.", actual=repr(result)[:200])
    return [_np.asarray(part, dtype=float) for part in (X_train, X_test, y_train, y_test)]


def split_ten(ctx):
    mod = _module(ctx, "train_test_split")
    X = _np.column_stack([_np.arange(10.0), _np.arange(10.0) * 2])
    y = 10 * X[:, 0]
    X_train, X_test, y_train, y_test = _split(mod, X, y, 0.3, 0)
    order = _np.random.default_rng(0).permutation(10)
    if len(X_test) != 3 or len(X_train) != 7:
        raise CheckFailed("Ten students with a test fraction of 0.3: three for testing, seven for training.",
                          expected="7 and 3", actual=f"{len(X_train)} and {len(X_test)}")
    if not (_np.allclose(y_train, 10 * X_train[:, 0]) and _np.allclose(y_test, 10 * X_test[:, 0])):
        raise CheckFailed("Each row of X has to stay with its own y. Shuffle the positions once and use them for both.")
    if not _np.allclose(X_test, X[order[:3]]):
        raise CheckFailed("Use order = rng.permutation(len(X)); the first three positions in order are the test rows.",
                          expected=f"X_test {X[order[:3]].tolist()}", actual=f"X_test {X_test.tolist()}")


def powers_small(ctx):
    mod = _module(ctx, "with_powers")
    X = _np.array([[10.0, 1.0, 2.0], [12.0, 2.0, 3.0]])
    got = mod.with_powers(X, 3)
    if got is None:
        raise CheckFailed("with_powers gave back None. Did it return the wider array?")
    got = _np.asarray(got, dtype=float)
    want = [[10.0, 1.0, 2.0, 4.0, 8.0], [12.0, 2.0, 3.0, 9.0, 27.0]]
    if got.shape != (2, 5) or not _np.allclose(got, want):
        raise CheckFailed("Degree 3 adds absences ** 2 and absences ** 3 after the columns already there. Absences is the last column.",
                          expected=want, actual=got.tolist())


def powers_degree_one(ctx):
    mod = _module(ctx, "with_powers")
    X = _np.array([[10.0, 1.0, 2.0], [12.0, 2.0, 3.0]])
    got = mod.with_powers(X, 1)
    if got is None:
        raise CheckFailed("with_powers gave back None. Did it return the wider array?")
    got = _np.asarray(got, dtype=float)
    if got.shape != (2, 3) or not _np.allclose(got, X):
        raise CheckFailed("Degree 1 adds nothing: absences is already there to the power 1.", expected=X.tolist(), actual=got.tolist())


def split_students(ctx):
    mod = _module(ctx, "train_test_split")
    X, y = _students()
    X_train, X_test, y_train, y_test = _split(mod, X, y, 0.2, 5)
    if len(X_test) != 71 or len(X_train) != 286:
        raise CheckFailed("A fifth of 357 students, rounded, is 71.", expected="286 and 71", actual=f"{len(X_train)} and {len(X_test)}")
    if sorted(map(tuple, _np.column_stack([_np.vstack([X_train, X_test]), _np.concatenate([y_train, y_test])]))) != sorted(map(tuple, _np.column_stack([X, y]))):
        raise CheckFailed("Every student should end up in exactly one of the two piles.")


def curve_on_students(ctx):
    mod = _module(ctx)
    X, y = _students()
    X_train, X_val, y_train, y_val = X[:250], X[250:], y[:250], y[250:]
    degrees = [1, 2, 3, 4, 5]
    result = mod.validation_curve(X_train, y_train, X_val, y_val, degrees)
    try:
        train_errors, val_errors = result
    except (TypeError, ValueError):
        raise CheckFailed("validation_curve should return two lists: training errors and validation errors.", actual=repr(result)[:200])
    want_train, want_val = _errors(X_train, y_train, X_val, y_val, degrees)
    if len(train_errors) != 5 or len(val_errors) != 5:
        raise CheckFailed("Five degrees, so five errors in each list.", expected="5 and 5", actual=f"{len(train_errors)} and {len(val_errors)}")
    if not _np.allclose(train_errors, want_train, rtol=1e-5):
        raise CheckFailed("The training errors are off. Add the powers, scale with the training rows, fit on them and score on them.",
                          expected=_np.round(want_train, 4).tolist(), actual=_np.round(_np.asarray(train_errors, dtype=float), 4).tolist())
    if not _np.allclose(val_errors, want_val, rtol=1e-5):
        raise CheckFailed("The validation errors are off. Scale the validation rows with the training rows' ruler, then score them.",
                          expected=_np.round(want_val, 4).tolist(), actual=_np.round(_np.asarray(val_errors, dtype=float), 4).tolist())


def _choice(ctx, X_train, y_train, X_val, y_val, degrees, what):
    mod = _module(ctx)
    train_errors, val_errors = _errors(X_train, y_train, X_val, y_val, degrees)
    want = degrees[int(_np.argmin(val_errors))]
    got = mod.choose_degree(X_train, y_train, X_val, y_val, degrees)
    if got != want:
        raise CheckFailed(f"{what} The degree with the lowest validation error is {want}.", expected=want, actual=got)


def choose_curved(ctx):
    rng = _np.random.default_rng(1)
    X_train = rng.uniform(0, 3, (30, 2))
    X_val = rng.uniform(0, 3, (30, 2))
    y_train = X_train[:, 0] + 2 * X_train[:, 1] - X_train[:, 1] ** 2 + rng.normal(0, 0.1, 30)
    y_val = X_val[:, 0] + 2 * X_val[:, 1] - X_val[:, 1] ** 2 + rng.normal(0, 0.1, 30)
    _choice(ctx, X_train, y_train, X_val, y_val, [1, 2, 3, 4, 5, 6], "The last column really is curved here.")


def choose_from_list(ctx):
    _module(ctx)
    X, y = _students()
    _choice(ctx, X[:200], y[:200], X[200:], y[200:], [1, 3, 5, 7], "Only odd degrees this time.")


def _line(ctx, start, want, why):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    lines = [line.strip() for line in result.output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=result.output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def piles(ctx):
    _line(ctx, "Learning from", "Learning from 214 students, choosing with 72, testing with 71",
          "Lock a fifth away for testing first, then keep a quarter of the rest for validation, with the same rng.")


def weights_from_training(ctx):
    _line(ctx, "first_term", "first_term   +2.71",
          "Learn the weights from the training students only, scaled with their own ruler.")


def table(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    rows = {}
    for line in result.output.splitlines():
        found = _re.match(r"^\s*(\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$", line)
        if found:
            rows[int(found.group(1))] = (float(found.group(2)), float(found.group(3)))
    for degree, train_error, val_error in TABLE:
        if degree not in rows:
            raise CheckFailed(f"There's no row for degree {degree}: the degree, then the training error, then the validation error.",
                              expected=f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}", actual=result.output)
        got_train, got_val = rows[degree]
        if abs(got_train - train_error) > 0.0015 or abs(got_val - val_error) > 0.0015 * max(1.0, val_error):
            raise CheckFailed(f"The errors for degree {degree} are off. Is the split exactly as the requirements say?",
                              expected=f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}",
                              actual=f"{degree:6}  {got_train:8.3f}  {got_val:10.3f}")


def chosen(ctx):
    _line(ctx, "Chosen degree:", "Chosen degree: 2", "Choose the degree with the lowest validation error.")


def test_error(ctx):
    _line(ctx, "Test error:", "Test error: 1.29 marks",
          "Fit the chosen degree on the training students, then score it on the test students: the square root of the mean squared error.")


def guessing(ctx):
    _line(ctx, "Guessing the average:", "Guessing the average: 3.32 marks",
          "Guess the training students' mean for every test student, and score that the same way.")


TESTS = [
    custom("train_test_split keeps 3 of 10 students for testing", split_ten, visible=True),
    custom("with_powers adds absences squared and cubed", powers_small, visible=True),
    custom("Degree 1 adds nothing", powers_degree_one,
           hint="If only this fails, the powers start at 2: range(2, degree + 1) is empty for degree 1."),
    custom("A fifth of 357 students", split_students),
    custom("validation_curve on the students", curve_on_students,
           hint="If only this fails, each degree needs its own ruler: work out the means and spreads after adding the powers."),
    custom("choose_degree picks by validation error", choose_curved),
    custom("Degrees 1, 3, 5 and 7", choose_from_list,
           hint="If only this fails, give back the degree from the list, not its position in it."),
    custom("Three piles, in the right sizes", piles),
    custom("Weights learnt from the training students", weights_from_training),
    custom("Prints the validation curve", table),
    custom("Chooses a degree", chosen),
    custom("Opens the test students once", test_error),
    custom("Compares with guessing the average", guessing),
    output("Answers for the new student with the chosen model",
           expect="A new student, 12 after the first term: about 12.2 out of 20", match="contains"),
]
