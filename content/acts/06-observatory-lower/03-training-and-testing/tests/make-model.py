import re as _re

import numpy as _np

FEATURES = ["first_term", "study_time", "failures", "going_out", "absences"]
WEIGHTS = {"first_term": 2.81, "study_time": -0.02, "failures": -0.04, "going_out": -0.13, "absences": -0.34}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"exam_scores.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _students():
    import pandas as _pd
    table = _pd.read_csv("students.csv")
    X = table[FEATURES].to_numpy(dtype=float)
    return (X - X.mean(axis=0)) / X.std(axis=0), table["final"].to_numpy(dtype=float)


def _exact(X, y):
    solution = _np.linalg.lstsq(_np.column_stack([X, _np.ones(len(X))]), y, rcond=None)[0]
    return solution[:-1], solution[-1]


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two things.")
    try:
        first, second = value
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two things.", actual=repr(value)[:200])
    return first, second


def _descend(mod, X, y, rate, steps):
    result = mod.gradient_descent(X, y, rate, steps)
    if result is None:
        raise CheckFailed("gradient_descent gave back None. It should return w, b and the losses.")
    try:
        w, b, losses = result
    except (TypeError, ValueError):
        raise CheckFailed("gradient_descent should return three things: w, b, losses.", actual=repr(result)[:200])
    return _np.asarray(w, dtype=float), float(b), _np.asarray(losses, dtype=float)


def scale_small(ctx):
    mod = _module(ctx, "fit_scaler", "scale")
    X = _np.array([[10.0, 1.0], [14.0, 2.0], [18.0, 6.0]])
    means, spreads = _pair(mod.fit_scaler(X), "fit_scaler")
    if not _np.allclose(means, [14.0, 3.0]):
        raise CheckFailed("The column means are 14 and 3.", expected=[14.0, 3.0], actual=repr(means))
    scaled = mod.scale(X, means, spreads)
    if scaled is None:
        raise CheckFailed("scale gave back None. Did it return the scaled array?")
    scaled = _np.asarray(scaled, dtype=float)
    if scaled.shape != (3, 2):
        raise CheckFailed("Scaling keeps the shape: three rows, two columns.", expected=(3, 2), actual=scaled.shape)
    if not (_np.allclose(scaled.mean(axis=0), 0) and _np.allclose(scaled.std(axis=0), 1)):
        raise CheckFailed("Each scaled column should have mean 0 and spread 1.",
                          expected="means [0, 0], spreads [1, 1]",
                          actual=f"means {_np.round(scaled.mean(axis=0), 3).tolist()}, spreads {_np.round(scaled.std(axis=0), 3).tolist()}")


def predict_two_rows(ctx):
    mod = _module(ctx, "predict")
    got = mod.predict(_np.array([[1.0, 2.0], [3.0, 4.0]]), _np.array([0.5, -1.0]), 2.0)
    if got is None:
        raise CheckFailed("predict gave back None.")
    got = _np.asarray(got, dtype=float)
    if got.shape != (2,) or not _np.allclose(got, [0.5, -0.5]):
        raise CheckFailed("One prediction per row: 1 * 0.5 + 2 * -1 + 2, then 3 * 0.5 + 4 * -1 + 2.",
                          expected=[0.5, -0.5], actual=got.tolist())


def scale_one_row(ctx):
    mod = _module(ctx, "scale")
    got = mod.scale(_np.array([[12.0, 6.0]]), _np.array([10.0, 4.0]), _np.array([4.0, 8.0]))
    if got is None:
        raise CheckFailed("scale gave back None. Did it return the scaled array?")
    got = _np.asarray(got, dtype=float)
    if got.shape != (1, 2) or not _np.allclose(got, [[0.5, 0.25]]):
        raise CheckFailed("One student, scaled with the means and spreads it was given: (12 - 10) / 4 and (6 - 4) / 8.",
                          expected=[[0.5, 0.25]], actual=got.tolist())


def numerical_gradients(ctx):
    mod = _module(ctx, "predict", "gradients")
    rng = _np.random.default_rng(8)
    X = rng.normal(size=(12, 4))
    y = rng.normal(size=12)
    w = rng.normal(size=4)
    b = 0.3

    def loss(w, b):
        return _np.mean((X @ w + b - y) ** 2)

    dw, db = _pair(mod.gradients(X, y, w.copy(), b), "gradients")
    dw = _np.asarray(dw, dtype=float)
    if dw.shape != (4,):
        raise CheckFailed("Four columns, so dw holds four slopes.", expected=(4,), actual=dw.shape)
    nudge = 1e-6
    want = _np.zeros(4)
    for j in range(4):
        step = _np.zeros(4)
        step[j] = nudge
        want[j] = (loss(w + step, b) - loss(w - step, b)) / (2 * nudge)
    want_db = (loss(w, b + nudge) - loss(w, b - nudge)) / (2 * nudge)
    if not (_np.allclose(dw, want, rtol=1e-4, atol=1e-6) and abs(float(db) - want_db) < 1e-4):
        raise CheckFailed("Nudging each weight a tiny amount says the slopes are different.",
                          expected=f"dw {_np.round(want, 4).tolist()}, db {want_db:.4f}",
                          actual=f"dw {_np.round(dw, 4).tolist()}, db {float(db):.4f}")


def exact_weights(ctx):
    mod = _module(ctx, "fit_closed_form")
    rng = _np.random.default_rng(3)
    X = rng.normal(size=(20, 3))
    y = X @ _np.array([1.0, -2.0, 0.5]) + 4.0
    w, b = _pair(mod.fit_closed_form(X, y), "fit_closed_form")
    w = _np.asarray(w, dtype=float)
    if w.shape != (3,) or not _np.allclose(w, [1.0, -2.0, 0.5]) or abs(float(b) - 4.0) > 1e-6:
        raise CheckFailed("Every row is exactly 1 * a - 2 * b + 0.5 * c + 4, so least squares should find those.",
                          expected="w [1.0, -2.0, 0.5], b 4.0", actual=f"w {_np.round(w, 4).tolist()}, b {float(b):.4f}")


def descent_matches(ctx):
    mod = _module(ctx, "predict", "gradients", "gradient_descent")
    X, y = _students()
    want_w, want_b = _exact(X, y)
    w, b, losses = _descend(mod, X, y, 0.1, 500)
    if w.shape != (5,):
        raise CheckFailed("Five columns, so five weights.", expected=(5,), actual=w.shape)
    if not (_np.allclose(w, want_w, atol=1e-3) and abs(b - want_b) < 1e-3):
        raise CheckFailed("On the scaled students, 500 steps at 0.1 should land on the least squares answer.",
                          expected=f"w {_np.round(want_w, 3).tolist()}, b {want_b:.3f}",
                          actual=f"w {_np.round(w, 3).tolist()}, b {b:.3f}")


def loss_falls(ctx):
    mod = _module(ctx, "predict", "gradients", "gradient_descent")
    X, y = _students()
    w, b, losses = _descend(mod, X, y, 0.1, 100)
    if len(losses) != 100:
        raise CheckFailed("100 steps, so 100 losses.", expected=100, actual=len(losses))
    if not (_np.all(_np.isfinite(losses)) and _np.all(_np.diff(losses) <= 1e-12)):
        raise CheckFailed("On scaled columns at 0.1, the loss should fall at every step.")


def first_step(ctx):
    mod = _module(ctx, "predict", "gradients", "gradient_descent")
    X = _np.array([[1.0, 2.0], [3.0, -1.0], [0.0, 1.0]])
    y = _np.array([2.0, 1.0, -1.0])
    w, b, losses = _descend(mod, X, y, 0.1, 1)
    want_w = -0.1 * 2 * X.T @ (-y) / 3
    want_b = -0.1 * 2 * _np.mean(-y)
    if len(losses) != 1 or abs(losses[0] - _np.mean(y ** 2)) > 1e-9:
        raise CheckFailed("One step, one loss: the loss with every weight 0, before the step.",
                          expected=[round(float(_np.mean(y ** 2)), 4)], actual=_np.round(losses, 4).tolist())
    if not (_np.allclose(w, want_w) and abs(b - want_b) < 1e-9):
        raise CheckFailed("After one step from zeros, each weight moves by the rate times its slope.",
                          expected=f"w {_np.round(want_w, 4).tolist()}, b {want_b:.4f}",
                          actual=f"w {_np.round(w, 4).tolist()}, b {b:.4f}")


def weight_lines(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    for name, want in WEIGHTS.items():
        found = _re.search(rf"^\s*{name}\s+([+-]?\d+\.\d+)\s*$", result.output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line with {name} and its weight.", expected=f"{name:<12} {want:+.2f}", actual=result.output)
        if abs(float(found.group(1)) - want) > 0.011:
            raise CheckFailed(f"The weight for {name} is off. Is the program learning from the scaled columns?",
                              expected=f"{name:<12} {want:+.2f}", actual=found.group(0).strip())


TESTS = [
    custom("fit_scaler and scale give columns with mean 0 and spread 1", scale_small, visible=True,
           hint="Use X.mean(axis=0) and X.std(axis=0): one number per column."),
    custom("predict([[1, 2], [3, 4]], w=[0.5, -1], b=2) gives [0.5, -0.5]", predict_two_rows, visible=True),
    custom("scale uses the means and spreads it's given", scale_one_row,
           hint="If only this fails, scale should never work out its own means: it uses the ones passed in."),
    custom("The slopes match slopes measured by nudging", numerical_gradients,
           hint="If only this fails, dw is 2 * X.T @ miss divided by the number of rows, with miss = prediction minus actual."),
    custom("Least squares finds exact weights", exact_weights,
           hint="If only this fails, give least squares a column of ones for b, and split its answer into w and b."),
    custom("One step from all zeros", first_step,
           hint="If only this fails, start from np.zeros, keep the loss before each step, then step."),
    custom("500 steps land on least squares", descent_matches),
    custom("The loss falls at every step", loss_falls),
    custom("Prints a weight for each column", weight_lines),
    output("Says whether least squares agrees", expect="Least squares agrees: True", match="contains"),
    output("Answers for the new student", expect="A new student, 12 after the first term: about 12.3 out of 20", match="contains"),
    output("Answers for a struggling student", set_vars={"NEW_STUDENT": [8, 1, 2, 4, 10]},
           expect="A new student, 8 after the first term: about 8.4 out of 20", match="contains",
           hint="If only this fails, scale the new student with the means and spreads of every student, not of the new one alone."),
    output("Answers for a strong student", set_vars={"NEW_STUDENT": [16, 3, 0, 2, 0]},
           expect="A new student, 16 after the first term: about 16.0 out of 20", match="contains"),
]
