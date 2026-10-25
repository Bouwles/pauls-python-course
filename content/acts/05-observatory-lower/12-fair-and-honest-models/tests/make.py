import re as _re

import numpy as _np

NEEDED = ("load_bookings", "alone_scores", "suspicious", "honest_model", "group_report")
ALONE = {"days_ahead": 0.68, "party": 0.60, "cloud": 0.67, "first_visit": 0.60, "signed_book": 0.98}
_RUN = {}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"audit.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _report(mod, y_true, y_pred, groups):
    report = mod.group_report(_np.array(y_true), _np.array(y_pred), _np.array(groups))
    if not isinstance(report, dict):
        raise CheckFailed("group_report should return a dict, by group.", actual=repr(report)[:200])
    return report


def report_small(ctx):
    mod = _module(ctx, "group_report")
    report = _report(mod, [1, 1, 0, 1, 1, 0], [1, 1, 0, 0, 0, 1], ["town", "town", "town", "island", "island", "island"])
    if sorted(report) != ["island", "town"]:
        raise CheckFailed("One entry for each group.", expected=["island", "town"], actual=sorted(report))
    accuracy, given_away = report["town"]
    if abs(float(accuracy) - 1.0) > 1e-9 or abs(float(given_away)) > 1e-9:
        raise CheckFailed("Every town prediction is right, and nobody who came lost their slot.", expected="(1.0, 0.0)", actual=repr(report["town"]))
    accuracy, given_away = report["island"]
    if abs(float(accuracy)) > 1e-9 or abs(float(given_away) - 1.0) > 1e-9:
        raise CheckFailed("Every island prediction is wrong, and both islanders who came would have lost their slots.",
                          expected="(0.0, 1.0)", actual=repr(report["island"]))


def report_among_came(ctx):
    mod = _module(ctx, "group_report")
    report = _report(mod, [1, 1, 1, 1, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 0], ["town"] * 8)
    accuracy, given_away = report["town"]
    if abs(float(accuracy) - 0.625) > 1e-9:
        raise CheckFailed("Five of the eight predictions are right.", expected=0.625, actual=accuracy)
    if abs(float(given_away) - 0.25) > 1e-9:
        raise CheckFailed("Four visitors came, and one of them was predicted not to: a quarter. The no-shows don't count here.",
                          expected=0.25, actual=given_away)


def loads(ctx):
    mod = _module(ctx, "load_bookings")
    result = mod.load_bookings("bookings.csv")
    try:
        X, y, groups = result
    except (TypeError, ValueError):
        raise CheckFailed("load_bookings should return three things: X, y and groups.", actual=repr(result)[:200])
    X, y, groups = _np.asarray(X, dtype=float), _np.asarray(y), _np.asarray(groups)
    if X.shape != (360, 5) or y.shape != (360,) or groups.shape != (360,):
        raise CheckFailed("360 bookings: X has 5 columns, the FEATURES; y and groups have one entry each.",
                          expected="(360, 5), (360,), (360,)", actual=f"{X.shape}, {y.shape}, {groups.shape}")
    if not (_np.allclose(X[0], [24, 5, 3, 0, 0]) and y[0] == 0 and groups[0] == "town"):
        raise CheckFailed("The first booking: 24 days ahead, a party of 5, cloud 3, not a first visit, didn't sign, didn't come, from the town. The island column isn't a feature.",
                          expected="[24, 5, 3, 0, 0], 0, town", actual=f"{X[0].tolist()}, {y[0]}, {groups[0]}")
    if int(_np.sum(groups == "island")) != 47:
        raise CheckFailed("47 of the bookings are from the island.", expected=47, actual=int(_np.sum(groups == "island")))


def alone(ctx):
    from sklearn.model_selection import cross_val_score
    from sklearn.tree import DecisionTreeClassifier

    mod = _module(ctx, "alone_scores")
    rng = _np.random.default_rng(5)
    X = rng.normal(size=(60, 3))
    y = (X[:, 1] > 0).astype(int)
    got = mod.alone_scores(X, y, 4)
    if got is None or len(got) != 3:
        raise CheckFailed("One score for each column: three columns, three scores.", actual=repr(got)[:200])
    stump = DecisionTreeClassifier(max_depth=2, random_state=0)
    want = [cross_val_score(stump, X[:, [j]], y, cv=4).mean() for j in range(3)]
    if not _np.allclose(_np.asarray(got, dtype=float), want):
        raise CheckFailed("Each column alone, as a one-column table, with a depth-2 tree and the folds given.",
                          expected=_np.round(want, 3).tolist(), actual=_np.round(_np.asarray(got, dtype=float), 3).tolist())


def flags(ctx):
    mod = _module(ctx, "suspicious")
    got = mod.suspicious(["a", "b", "c", "d"], [0.6, 0.97, 0.95, 0.94], 0.95)
    if list(got or []) != ["b", "c"]:
        raise CheckFailed("Every name scoring at least the limit, in order.", expected=["b", "c"], actual=got)


def honest(ctx):
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    mod = _module(ctx, "honest_model")
    model = mod.honest_model()
    if not isinstance(model, Pipeline):
        raise CheckFailed("honest_model should give a pipeline, so the scaler is refitted inside every fold.", actual=repr(model))
    steps = [step for _, step in model.steps]
    if not (isinstance(steps[0], StandardScaler) and isinstance(steps[-1], LogisticRegression)):
        raise CheckFailed("Scale first, then LogisticRegression.", actual=repr(model))
    if hasattr(steps[-1], "coef_"):
        raise CheckFailed("honest_model should hand back an unfitted model.")


def _output(ctx):
    if "result" not in _RUN:
        _RUN["result"] = ctx.run_program()
    result = _RUN["result"]
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    return result.output


def _line(ctx, start, want, why):
    output = _output(ctx)
    lines = [line.strip() for line in output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def alone_table(ctx):
    output = _output(ctx)
    for name, want in ALONE.items():
        found = _re.search(rf"^\s*{name}\s+(\d\.\d+)\s*$", output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line with {name} and its score alone.", expected=f"{name:<12} {want:.2f}", actual=output)
        if abs(float(found.group(1)) - want) > 0.006:
            raise CheckFailed(f"{name}'s score alone is off. Five folds, a depth-2 tree, on bookings.csv.",
                              expected=f"{name:<12} {want:.2f}", actual=found.group(0).strip())


def dropped(ctx):
    _line(ctx, "Dropped:", "Dropped: signed_book", "Drop every column that scores 0.95 or more on its own.")


def cross_validated(ctx):
    _line(ctx, "Cross-validated accuracy:", "Cross-validated accuracy: 0.74",
          "Cross-validate the honest model on the columns you kept, with 5 folds.")


def drawer(ctx):
    _line(ctx, "Bottom drawer accuracy:", "Bottom drawer accuracy: 0.79",
          "Fit on every booking in bookings.csv, with the columns you kept, then score drawer.csv.")


def by_group(ctx):
    _line(ctx, "island", "island   accuracy 0.48, slot given away 0.57",
          "On the drawer's island bookings: the accuracy, and the share of those who came but were predicted not to.")
    _line(ctx, "town", "town     accuracy 0.84, slot given away 0.02", "The same for the town's bookings.")


TESTS = [
    custom("group_report scores each group on its own", report_small, visible=True),
    custom("given_away counts only the visitors who came", report_among_came, visible=True,
           hint="Of the visitors who came, what share were predicted not to? The no-shows aren't in it."),
    custom("load_bookings reads 360 bookings", loads,
           hint="If only this fails, X is the FEATURES columns only: not the booking number, not island, not came."),
    custom("alone_scores tries each column on its own", alone),
    custom("suspicious flags scores at or over the limit", flags),
    custom("honest_model scales inside a pipeline", honest),
    custom("Prints each column's score alone", alone_table),
    custom("Drops the column that knows the answer", dropped),
    custom("Cross-validates what's left", cross_validated),
    custom("Opens the bottom drawer once", drawer),
    custom("Reports by group", by_group),
]
