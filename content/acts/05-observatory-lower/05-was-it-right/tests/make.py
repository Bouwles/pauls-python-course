import re as _re

import numpy as _np

NEEDED = ("confusion", "precision", "recall", "f1", "roc_curve", "auc", "threshold_for_recall")


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"storms.py needs a function called {name}. The list is at the top of the file.")
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
        raise CheckFailed("Two warned storms, two false alarms, two missed storms, two quiet calm nights.",
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
        raise CheckFailed("Never warning: no true positives, no false alarms, one missed storm, five quiet nights.",
                          expected=(0, 0, 1, 5), actual=got)


def nothing_to_divide(ctx):
    mod = _module(ctx, "precision", "recall", "f1")
    try:
        got = (_number(mod.precision(0, 0), "precision(0, 0)"), _number(mod.recall(0, 0), "recall(0, 0)"), _number(mod.f1(0.0, 0.0), "f1(0, 0)"))
    except ZeroDivisionError:
        raise CheckFailed("With nothing to divide by, the answer should be 0.0, not a ZeroDivisionError.")
    if got != (0.0, 0.0, 0.0):
        raise CheckFailed("No warnings, no storms, nothing caught: each should be 0.0.", expected=(0.0, 0.0, 0.0), actual=got)


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
        raise CheckFailed("On eighty nights of other readings, the AUC should equal the chance a storm night outranks a calm one.",
                          expected=round(want, 4), actual=round(got, 4))


def recall_threshold(ctx):
    mod = _module(ctx, "confusion", "recall", "threshold_for_recall")
    y = _np.array([1, 0, 1, 0, 1])
    chances = _np.array([0.9, 0.7, 0.6, 0.3, 0.2])
    for target, want in [(0.6, 0.6), (0.3, 0.9), (1.0, 0.2)]:
        got = mod.threshold_for_recall(y, chances, target)
        if got is None or abs(float(got) - want) > 1e-9:
            raise CheckFailed(f"Storms at 0.9, 0.6 and 0.2. The highest threshold with a recall of at least {target}.",
                              expected=want, actual=got)


def table(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    if not _re.search(r"^\s*warned\s+12\s+3\s*$", result.output, _re.M) or not _re.search(r"^\s*not warned\s+13\s+372\s*$", result.output, _re.M):
        raise CheckFailed("The table should have a warned row and a not warned row, storms first, then calm nights.",
                          expected="warned           12      3\nnot warned       13    372", actual=result.output)


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Count it yourself with NumPy. scikit-learn comes later in the Act.")


TESTS = [
    custom("confusion counts four kinds of night", confusion_small, visible=True),
    custom("precision(3, 1), recall(3, 5) and their F1", scores_small, visible=True),
    custom("A forecast that never warns", confusion_lopsided),
    custom("Nothing to divide by gives 0.0", nothing_to_divide,
           hint="If only this fails, check for a zero total before dividing, and return 0.0."),
    custom("roc_curve on four nights", curve_small,
           hint="If only this fails, start both lists at 0.0, then go through the distinct chances from highest to lowest."),
    custom("roc_curve when chances tie", curve_ties,
           hint="If only this fails, use each distinct chance once: np.unique gives them sorted, lowest first."),
    custom("auc adds up trapezoids", area_small),
    custom("The AUC is the chance a storm outranks a calm night", area_is_ranking),
    custom("threshold_for_recall", recall_threshold,
           hint="If only this fails, try the distinct chances from the highest down, and stop at the first that's enough."),
    custom("Built from scratch", no_library),
    custom("Prints the confusion matrix", table),
    output("Accuracy, precision, recall and F1", expect="Accuracy 0.96, precision 0.80, recall 0.48, F1 0.60", match="contains"),
    output("Against saying calm every night", expect="Saying calm every night: accuracy 0.94, recall 0.00", match="contains"),
    output("The area under the curve", expect="AUC: 0.950", match="contains"),
    output("Nine storms in ten", expect="To catch 90% of storms, warn at 0.12 or more: precision 0.44, 29 false alarms", match="contains"),
    output("A threshold of 0.3", set_vars={"THRESHOLD": 0.3},
           expect="Accuracy 0.96, precision 0.71, recall 0.68, F1 0.69", match="contains",
           hint="If only this fails, use THRESHOLD for the table and the scores, not 0.5 written in again."),
    output("Four storms in five", set_vars={"TARGET_RECALL": 0.8},
           expect="To catch 80% of storms, warn at 0.20 or more: precision 0.53, 18 false alarms", match="contains"),
    output("Every storm, whatever it costs", set_vars={"TARGET_RECALL": 1.0},
           expect="To catch 100% of storms, warn at 0.00 or more: precision 0.06, 375 false alarms", match="contains"),
]
