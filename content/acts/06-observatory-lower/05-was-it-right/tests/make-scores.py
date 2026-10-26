import re as _re

import numpy as _np

NEEDED = ("confusion", "precision", "recall", "f1", "roc_curve", "auc", "threshold_for_recall")


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"diabetes.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _number(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    if _np.ndim(value) != 0:
        raise CheckFailed(f"{what} should give back one number.", actual=repr(value)[:200])
    return float(value)


def _curve(mod, y, chances):
    result = mod.roc_curve(_np.asarray(y), _np.asarray(chances, dtype=float))
    try:
        fpr, tpr = result
    except (TypeError, ValueError):
        raise CheckFailed("roc_curve should return two arrays: fpr, tpr.", actual=repr(result)[:200])
    return _np.asarray(fpr, dtype=float), _np.asarray(tpr, dtype=float)


def _ranked(y, chances):
    pos, neg = chances[y == 1], chances[y == 0]
    return _np.mean(pos[:, None] > neg[None, :]) + 0.5 * _np.mean(pos[:, None] == neg[None, :])


def confusion_small(ctx):
    mod = _module(ctx, "confusion")
    y = _np.array([1, 0, 1, 1, 0, 0, 0, 1])
    warned = _np.array([1, 1, 0, 1, 0, 0, 1, 0])
    got = mod.confusion(y, warned)
    try:
        got = tuple(int(v) for v in got)
    except (TypeError, ValueError):
        raise CheckFailed("confusion should return four whole numbers: tp, fp, fn, tn.", actual=repr(got)[:200])
    if got != (2, 2, 2, 2):
        raise CheckFailed("Two cases flagged, two flagged without it, two cases missed, two rightly left alone.",
                          expected=(2, 2, 2, 2), actual=got)


def scores_small(ctx):
    mod = _module(ctx, "precision", "recall", "f1")
    p = _number(mod.precision(3, 1), "precision(3, 1)")
    r = _number(mod.recall(3, 5), "recall(3, 5)")
    f = _number(mod.f1(0.75, 0.375), "f1(0.75, 0.375)")
    if abs(p - 0.75) > 1e-9 or abs(r - 0.375) > 1e-9 or abs(f - 0.5) > 1e-9:
        raise CheckFailed("precision(3, 1) is 3/4; recall(3, 5) is 3/8; F1 of those is 2 * 0.75 * 0.375 / 1.125.",
                          expected="0.75, 0.375, 0.5", actual=f"{p}, {r}, {f}")


def confusion_lopsided(ctx):
    mod = _module(ctx, "confusion")
    y = _np.array([0, 0, 0, 0, 1, 0])
    got = tuple(int(v) for v in mod.confusion(y, _np.zeros(6, dtype=int)))
    if got != (0, 0, 1, 5):
        raise CheckFailed("Never flagging: no true positives, no false alarms, one missed case, five rightly left alone.",
                          expected=(0, 0, 1, 5), actual=got)


def nothing_to_divide(ctx):
    mod = _module(ctx, "precision", "recall", "f1")
    try:
        got = (_number(mod.precision(0, 0), "precision(0, 0)"), _number(mod.recall(0, 0), "recall(0, 0)"), _number(mod.f1(0.0, 0.0), "f1(0, 0)"))
    except ZeroDivisionError:
        raise CheckFailed("With nothing to divide by, the answer should be 0.0, not a ZeroDivisionError.")
    if got != (0.0, 0.0, 0.0):
        raise CheckFailed("No flags, no cases, nothing caught: each should be 0.0.", expected=(0.0, 0.0, 0.0), actual=got)


def curve_small(ctx):
    mod = _module(ctx, "confusion", "roc_curve")
    fpr, tpr = _curve(mod, [1, 0, 1, 0], [0.9, 0.8, 0.4, 0.1])
    want_fpr, want_tpr = [0.0, 0.0, 0.5, 0.5, 1.0], [0.0, 0.5, 0.5, 1.0, 1.0]
    if fpr.shape != (5,) or not (_np.allclose(fpr, want_fpr) and _np.allclose(tpr, want_tpr)):
        raise CheckFailed("Start at (0, 0), then one point for each chance as the threshold, from 0.9 down to 0.1.",
                          expected=f"fpr {want_fpr}, tpr {want_tpr}", actual=f"fpr {fpr.tolist()}, tpr {tpr.tolist()}")


def curve_ties(ctx):
    mod = _module(ctx, "confusion", "roc_curve")
    fpr, tpr = _curve(mod, [1, 0, 1, 0, 0], [0.5, 0.5, 0.2, 0.2, 0.2])
    want_fpr, want_tpr = [0.0, 1 / 3, 1.0], [0.0, 0.5, 1.0]
    if fpr.shape != (3,) or not (_np.allclose(fpr, want_fpr) and _np.allclose(tpr, want_tpr)):
        raise CheckFailed("Only two distinct chances, so two thresholds and three points.",
                          expected=f"fpr {[round(v, 3) for v in want_fpr]}, tpr {want_tpr}",
                          actual=f"fpr {_np.round(fpr, 3).tolist()}, tpr {tpr.tolist()}")


def area_small(ctx):
    mod = _module(ctx, "auc")
    cases = [([0.0, 0.0, 1.0], [0.0, 1.0, 1.0], 1.0), ([0.0, 1.0], [0.0, 1.0], 0.5),
             ([0.0, 0.0, 0.5, 0.5, 1.0], [0.0, 0.5, 0.5, 1.0, 1.0], 0.75)]
    for fpr, tpr, want in cases:
        got = _number(mod.auc(_np.array(fpr), _np.array(tpr)), "auc")
        if abs(got - want) > 1e-9:
            raise CheckFailed(f"The area under the curve through fpr {fpr}, tpr {tpr}.", expected=want, actual=got)


def area_is_ranking(ctx):
    mod = _module(ctx, "confusion", "roc_curve", "auc")
    rng = _np.random.default_rng(17)
    y = (rng.random(80) < 0.2).astype(int)
    chances = _np.round(_np.clip(0.2 + 0.3 * y + rng.normal(0, 0.2, 80), 0, 1), 1)
    fpr, tpr = _curve(mod, y, chances)
    got = _number(mod.auc(fpr, tpr), "auc")
    want = _ranked(y, chances)
    if abs(got - want) > 1e-9:
        raise CheckFailed("On eighty other respondents, the AUC should equal the chance a case outranks a non-case.",
                          expected=round(want, 4), actual=round(got, 4))


def recall_threshold(ctx):
    mod = _module(ctx, "confusion", "recall", "threshold_for_recall")
    y = _np.array([1, 0, 1, 0, 1])
    chances = _np.array([0.9, 0.7, 0.6, 0.3, 0.2])
    for target, want in [(0.6, 0.6), (0.3, 0.9), (1.0, 0.2)]:
        got = mod.threshold_for_recall(y, chances, target)
        if got is None or abs(float(got) - want) > 1e-9:
            raise CheckFailed(f"Cases at 0.9, 0.6 and 0.2. The highest threshold with a recall of at least {target}.",
                              expected=want, actual=got)


def table(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    if not _re.search(r"^\s*flagged\s+8\s+8\s*$", result.output, _re.M) or not _re.search(r"^\s*not flagged\s+67\s+417\s*$", result.output, _re.M):
        raise CheckFailed("The table should have a flagged row and a not flagged row, cases first, then the rest, on the test respondents.",
                          expected="flagged              8      8\nnot flagged         67    417", actual=result.output)


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Count it yourself with NumPy. scikit-learn has all of these, but then you wouldn't know what they count.")


TESTS = [
    custom("confusion counts four kinds of respondent", confusion_small, visible=True),
    custom("precision(3, 1), recall(3, 5) and their F1", scores_small, visible=True),
    custom("A model that never flags anyone", confusion_lopsided),
    custom("Nothing to divide by gives 0.0", nothing_to_divide,
           hint="If only this fails, check for a zero total before dividing, and return 0.0."),
    custom("roc_curve on four respondents", curve_small,
           hint="If only this fails, start both lists at 0.0, then go through the distinct chances from highest to lowest."),
    custom("roc_curve when chances tie", curve_ties,
           hint="If only this fails, use each distinct chance once: np.unique gives them sorted, lowest first."),
    custom("auc adds up trapezoids", area_small),
    custom("The AUC is the chance a case outranks a non-case", area_is_ranking),
    custom("threshold_for_recall", recall_threshold,
           hint="If only this fails, try the distinct chances from the highest down, and stop at the first that's enough."),
    custom("Built from scratch", no_library),
    custom("Prints the confusion matrix", table),
    output("Accuracy, precision, recall and F1", expect="Accuracy 0.85, precision 0.50, recall 0.11, F1 0.18", match="contains"),
    output("Against saying no to everyone", expect="Saying no to everyone: accuracy 0.85, recall 0.00", match="contains"),
    output("The area under the curve", expect="AUC: 0.811", match="contains",
           hint="Draw the curve from the test respondents' chances, not the training ones."),
    output("A threshold for screening, chosen on training", expect="To catch 85% of cases in training, flag at 0.10 or more.", match="contains",
           hint="Choose the threshold from the training respondents' chances, so the test pile stays unseen."),
    output("What it does on the test respondents", expect="On the test respondents: recall 0.77, precision 0.32, 183 of 500 flagged", match="contains"),
    output("The respondent, flagged", expect="Respondent: 27% chance. Flag for a test.", match="contains"),
    output("A threshold of 0.2", set_vars={"THRESHOLD": 0.2},
           expect="Accuracy 0.79, precision 0.38, recall 0.56, F1 0.45", match="contains",
           hint="If only this fails, use THRESHOLD for the table and the scores, not 0.5 written in again."),
    output("Seven cases in ten", set_vars={"TARGET_RECALL": 0.7},
           expect="On the test respondents: recall 0.61, precision 0.36, 128 of 500 flagged", match="contains"),
    output("A young, active respondent", set_vars={"RESPONDENT": [24, 5, 0, 0, 2, 1]},
           expect="Respondent: 1% chance. No flag.", match="contains",
           hint="If only this fails, compare the chance with the screening threshold, not with 0.5."),
]
