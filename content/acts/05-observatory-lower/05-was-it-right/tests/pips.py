def _module(ctx):
    mod = ctx.module()
    for name in ("precision", "recall"):
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"scores.py needs its {name} function.")
    return mod


def small_counts(ctx):
    mod = _module(ctx)
    p, r = float(mod.precision(3, 1, 5)), float(mod.recall(3, 1, 5))
    if abs(p - 0.75) > 1e-9 or abs(r - 0.375) > 1e-9:
        raise CheckFailed("Four warnings, three of them right: precision 3/4. Eight storms, three of them warned: recall 3/8.",
                          expected="precision 0.75, recall 0.375", actual=f"precision {p}, recall {r}")


def more_counts(ctx):
    mod = _module(ctx)
    p, r = float(mod.precision(9, 6, 1)), float(mod.recall(9, 6, 1))
    if abs(p - 0.6) > 1e-9 or abs(r - 0.9) > 1e-9:
        raise CheckFailed("Fifteen warnings, nine right; ten storms, nine warned.",
                          expected="precision 0.6, recall 0.9", actual=f"precision {p}, recall {r}")


TESTS = [
    output("Precision at 0.5", expect="Precision: 0.80", match="contains", visible=True),
    output("Recall at 0.5", expect="Recall: 0.48", match="contains", visible=True),
    custom("3 right warnings, 1 false alarm, 5 missed storms", small_counts,
           hint="Precision starts from the warnings, tp + fp. Recall starts from the storms, tp + fn."),
    custom("9 right warnings, 6 false alarms, 1 missed storm", more_counts),
    output("A more cautious threshold: 0.3", set_vars={"THRESHOLD": 0.3}, expect="Recall: 0.68", match="contains"),
]
