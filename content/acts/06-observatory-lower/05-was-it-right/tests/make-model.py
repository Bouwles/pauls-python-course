import re as _re

import numpy as _np

NEEDED = ("sigmoid", "predict_proba", "log_loss", "gradients", "train", "decide", "accuracy")
WEIGHTS = {"bmi": 0.39, "age_band": 0.30, "high_bp": 0.58, "high_chol": 0.27, "general_health": 0.79, "exercise": -0.04}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"diabetes.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _array(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    return _np.asarray(value, dtype=float)


def _number(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    if _np.ndim(value) != 0:
        raise CheckFailed(f"{what} should give back one number, not an array.", actual=repr(value)[:200])
    return float(value)


def _pair(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. It should return two things.")
    try:
        first, second = value
    except (TypeError, ValueError):
        raise CheckFailed(f"{what} should return two things.", actual=repr(value)[:200])
    return first, second


def _train(mod, X, y, rate, steps):
    result = mod.train(X, y, rate, steps)
    if result is None:
        raise CheckFailed("train gave back None. It should return w, b and the losses.")
    try:
        w, b, losses = result
    except (TypeError, ValueError):
        raise CheckFailed("train should return three things: w, b, losses.", actual=repr(result)[:200])
    return _np.asarray(w, dtype=float), float(b), _np.asarray(losses, dtype=float)


def _loss(X, y, w, b):
    p = 1 / (1 + _np.exp(-(X @ w + b)))
    return -_np.mean(y * _np.log(p) + (1 - y) * _np.log(1 - p))


def _sample():
    rng = _np.random.default_rng(21)
    X = rng.normal(size=(60, 3))
    score = 1.5 * X[:, 0] - 2.0 * X[:, 1] + 0.5 * X[:, 2] - 0.3
    y = (rng.random(60) < 1 / (1 + _np.exp(-score))).astype(float)
    return X, y


def sigmoid_three(ctx):
    mod = _module(ctx, "sigmoid")
    got = _array(mod.sigmoid(_np.array([-2.0, 0.0, 2.0])), "sigmoid")
    want = 1 / (1 + _np.exp(-_np.array([-2.0, 0.0, 2.0])))
    if got.shape != (3,) or not _np.allclose(got, want):
        raise CheckFailed("The sigmoid of -2, 0 and 2.", expected=_np.round(want, 3).tolist(), actual=_np.round(got, 3).tolist())


def log_loss_two(ctx):
    mod = _module(ctx, "log_loss")
    got = _number(mod.log_loss(_np.array([1.0, 0.0]), _np.array([0.8, 0.1])), "log_loss")
    want = -(_np.log(0.8) + _np.log(0.9)) / 2
    if abs(got - want) > 1e-9:
        raise CheckFailed("Diabetes with a chance of 0.8 costs -log(0.8); none with a chance of 0.1 costs -log(0.9). The mean of those.",
                          expected=round(want, 4), actual=round(got, 4))


def log_loss_dry_side(ctx):
    mod = _module(ctx, "log_loss")
    got = _number(mod.log_loss(_np.array([0.0, 0.0, 1.0]), _np.array([0.7, 0.2, 0.6])), "log_loss")
    want = -(_np.log(0.3) + _np.log(0.8) + _np.log(0.6)) / 3
    if abs(got - want) > 1e-9:
        raise CheckFailed("A respondent without diabetes is charged for the chance of none, 1 - p, not for p.",
                          expected=round(want, 4), actual=round(got, 4))


def predict_rows(ctx):
    mod = _module(ctx, "sigmoid", "predict_proba")
    got = _array(mod.predict_proba(_np.array([[1.0, 2.0], [0.0, -1.0], [2.0, 1.0]]), _np.array([0.5, -1.0]), 1.5), "predict_proba")
    want = 1 / (1 + _np.exp(-_np.array([0.0, 2.5, 1.5])))
    if got.shape != (3,) or not _np.allclose(got, want):
        raise CheckFailed("One chance per row: the sigmoid of X @ w + b.", expected=_np.round(want, 3).tolist(), actual=_np.round(got, 3).tolist())


def numerical(ctx):
    mod = _module(ctx, "sigmoid", "predict_proba", "gradients")
    X, y = _sample()
    nudge = 1e-6
    for w, b in [(_np.zeros(3), 0.0), (_np.array([0.4, -0.8, 1.1]), 0.6)]:
        dw, db = _pair(mod.gradients(X, y, w.copy(), b), "gradients")
        dw = _np.asarray(dw, dtype=float)
        if dw.shape != (3,):
            raise CheckFailed("Three columns, so dw holds three slopes.", expected=(3,), actual=dw.shape)
        want = _np.zeros(3)
        for j in range(3):
            step = _np.zeros(3)
            step[j] = nudge
            want[j] = (_loss(X, y, w + step, b) - _loss(X, y, w - step, b)) / (2 * nudge)
        want_db = (_loss(X, y, w, b + nudge) - _loss(X, y, w, b - nudge)) / (2 * nudge)
        if not (_np.allclose(dw, want, rtol=1e-4, atol=1e-7) and abs(float(db) - want_db) < 1e-6):
            raise CheckFailed(f"At w = {w.tolist()}, b = {b}, nudging each weight says the slopes of the log loss are different.",
                              expected=f"dw {_np.round(want, 4).tolist()}, db {want_db:.4f}",
                              actual=f"dw {_np.round(dw, 4).tolist()}, db {float(db):.4f}")


def first_step(ctx):
    mod = _module(ctx)
    X = _np.array([[1.0, 2.0], [3.0, -1.0], [0.0, 1.0]])
    y = _np.array([1.0, 0.0, 1.0])
    w, b, losses = _train(mod, X, y, 0.5, 1)
    want_w = -0.5 * X.T @ (0.5 - y) / 3
    want_b = -0.5 * _np.mean(0.5 - y)
    if len(losses) != 1 or abs(losses[0] - _np.log(2)) > 1e-9:
        raise CheckFailed("One step, one loss: with every weight 0, every chance is 0.5, and the log loss is log 2.",
                          expected=[round(float(_np.log(2)), 4)], actual=_np.round(losses, 4).tolist())
    if not (w.shape == (2,) and _np.allclose(w, want_w) and abs(b - want_b) < 1e-9):
        raise CheckFailed("After one step from zeros, each weight moves by the rate times its slope.",
                          expected=f"w {_np.round(want_w, 4).tolist()}, b {want_b:.4f}",
                          actual=f"w {_np.round(w, 4).tolist()}, b {b:.4f}")


def loss_falls(ctx):
    mod = _module(ctx)
    X, y = _sample()
    w, b, losses = _train(mod, X, y, 1.0, 200)
    if len(losses) != 200:
        raise CheckFailed("200 steps, so 200 losses.", expected=200, actual=len(losses))
    if not (_np.all(_np.isfinite(losses)) and _np.all(_np.diff(losses) <= 1e-12)):
        raise CheckFailed("At a rate of 1.0 on these answers, the log loss should fall at every step.")
    if not losses[-1] < 0.8 * losses[0]:
        raise CheckFailed("After 200 steps the log loss should be well below where it started.",
                          expected=f"under {0.8 * losses[0]:.3f}", actual=f"{losses[-1]:.3f}")


def decide_threshold(ctx):
    mod = _module(ctx, "decide")
    p = _np.array([0.2, 0.5, 0.71, 0.3])
    for threshold, want in [(0.5, [0, 1, 1, 0]), (0.3, [0, 1, 1, 1]), (0.8, [0, 0, 0, 0])]:
        got = mod.decide(p, threshold)
        if got is None or _np.shape(got) != (4,) or not _np.array_equal(_np.asarray(got), want):
            raise CheckFailed(f"Chances {p.tolist()} at a threshold of {threshold}. A chance exactly on the threshold is flagged.",
                              expected=want, actual=repr(got))


def decide_default(ctx):
    mod = _module(ctx, "decide")
    got = mod.decide(_np.array([0.49, 0.5, 0.9]))
    if got is None or not _np.array_equal(_np.asarray(got), [0, 1, 1]):
        raise CheckFailed("With no threshold given, decide uses 0.5.", expected=[0, 1, 1], actual=repr(got))


def accuracy_share(ctx):
    mod = _module(ctx, "accuracy")
    got = _number(mod.accuracy(_np.array([1, 0, 1, 1, 0]), _np.array([1, 1, 1, 0, 0])), "accuracy")
    if abs(got - 0.6) > 1e-9:
        raise CheckFailed("Three of five match.", expected=0.6, actual=got)


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Build it from scratch with NumPy. scikit-learn would hide the part this project is about.")


def weight_lines(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    for name, want in WEIGHTS.items():
        found = _re.search(rf"^\s*{name}\s+([+-]?\d+\.\d+)\s*$", result.output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line with {name} and its weight.", expected=f"{name:<16} {want:+.2f}", actual=result.output)
        if abs(float(found.group(1)) - want) > 0.011:
            raise CheckFailed(f"The weight for {name} is off. Scaled with the training respondents' ruler? Rate 1.0, 1,000 steps?",
                              expected=f"{name:<16} {want:+.2f}", actual=found.group(0).strip())


TESTS = [
    custom("sigmoid of -2, 0 and 2", sigmoid_three, visible=True),
    custom("log_loss for a case at 0.8 and a non-case at 0.1", log_loss_two, visible=True),
    custom("A non-case is charged for 1 - p", log_loss_dry_side,
           hint="If only this fails, check the second half of the log loss: (1 - y) * log(1 - p)."),
    custom("predict_proba gives one chance per row", predict_rows),
    custom("The slopes match slopes measured by nudging", numerical,
           hint="If only this fails, the miss is the chance minus the answer, and dw divides X.T @ miss by the number of rows."),
    custom("One step from all zeros", first_step,
           hint="If only this fails, start from zeros, keep the loss before each step, then step."),
    custom("The log loss falls at every step", loss_falls),
    custom("decide at thresholds of 0.5, 0.3 and 0.8", decide_threshold,
           hint="If only this fails, a chance exactly equal to the threshold counts: use >=."),
    custom("decide uses 0.5 when no threshold is given", decide_default),
    custom("accuracy is the share that match", accuracy_share),
    custom("Built from scratch", no_library),
    custom("Prints each column's weight", weight_lines),
    output("Test accuracy", expect="Test accuracy: 0.85", match="contains",
           hint="Score the test respondents, scaled with the training respondents' means and spreads, at THRESHOLD."),
    output("Saying no to everyone", expect="Saying no to everyone: 0.85", match="contains"),
    output("The respondent", expect="Respondent: 27% chance of diabetes or prediabetes", match="contains",
           hint="Scale RESPONDENT with the training respondents' means and spreads, and print the chance with {:.0%}."),
    output("A young, active respondent", set_vars={"RESPONDENT": [24, 5, 0, 0, 2, 1]},
           expect="Respondent: 1% chance of diabetes or prediabetes", match="contains"),
    output("An older respondent in poor health", set_vars={"RESPONDENT": [33, 10, 1, 1, 4, 0]},
           expect="Respondent: 50% chance of diabetes or prediabetes", match="contains",
           hint="If only this fails, work the chance out from RESPONDENT, not from the first respondent written in again."),
]
