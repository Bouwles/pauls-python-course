import re as _re

import numpy as _np

NEEDED = ("load_bookings", "alone_scores", "suspicious", "best_neighbours", "build_models",
          "cross_validate", "always_commonest", "group_report")
NAMES = ["logistic", "neighbours", "tree", "forest"]
ALONE = {"days_ahead": 0.68, "party": 0.60, "cloud": 0.67, "first_visit": 0.60, "signed_book": 0.98}
TABLE = {"logistic": 0.736, "neighbours": 0.764, "tree": 0.750, "forest": 0.778}
_RUN = {}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"clinic.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _report(mod, y_true, y_pred, groups):
    report = mod.group_report(_np.array(y_true), _np.array(y_pred), _np.array(groups))
    if not isinstance(report, dict):
        raise CheckFailed("group_report should return a dict, by group.", actual=repr(report)[:200])
    return report


def report_small(ctx):
    mod = _module(ctx, "group_report")
    report = _report(mod, [1, 1, 0, 1, 1, 0], [1, 1, 0, 0, 0, 1], ["city", "city", "city", "outside", "outside", "outside"])
    if sorted(report) != ["city", "outside"]:
        raise CheckFailed("One entry for each group.", expected=["city", "outside"], actual=sorted(report))
    accuracy, given_away = report["city"]
    if abs(float(accuracy) - 1.0) > 1e-9 or abs(float(given_away)) > 1e-9:
        raise CheckFailed("Every city prediction is right, and nobody who came lost their slot.", expected="(1.0, 0.0)", actual=repr(report["city"]))
    accuracy, given_away = report["outside"]
    if abs(float(accuracy)) > 1e-9 or abs(float(given_away) - 1.0) > 1e-9:
        raise CheckFailed("Every outside prediction is wrong, and both visitors from outside who came would have lost their slots.",
                          expected="(0.0, 1.0)", actual=repr(report["outside"]))


def report_among_came(ctx):
    mod = _module(ctx, "group_report")
    report = _report(mod, [1, 1, 1, 1, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 0], ["city"] * 8)
    accuracy, given_away = report["city"]
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
    if not (_np.allclose(X[0], [24, 5, 3, 0, 0]) and y[0] == 0 and groups[0] == "city"):
        raise CheckFailed("The first booking: 24 days ahead, a party of 5, cloud 3, not a first visit, didn't sign, didn't come, from the city. The outside column isn't a feature.",
                          expected="[24, 5, 3, 0, 0], 0, city", actual=f"{X[0].tolist()}, {y[0]}, {groups[0]}")
    if int(_np.sum(groups == "outside")) != 47:
        raise CheckFailed("47 of the bookings are from outside the city.", expected=47, actual=int(_np.sum(groups == "outside")))


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


def _small_data(seed=4, n=90):
    rng = _np.random.default_rng(seed)
    X = rng.normal(size=(n, 3)) * _np.array([1.0, 50.0, 0.1])
    y = ((X[:, 0] + X[:, 1] / 50 + rng.normal(0, 0.7, n)) > 0).astype(int)
    return X, y


def four_models(ctx):
    from sklearn.base import is_classifier
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    mod = _module(ctx, "build_models")
    models = mod.build_models(15)
    if not isinstance(models, dict):
        raise CheckFailed("build_models should return a dict of models, by name.", actual=type(models).__name__)
    if sorted(models) != sorted(NAMES):
        raise CheckFailed("The dict needs exactly these four names.", expected=NAMES, actual=sorted(models))
    for name in NAMES:
        if not is_classifier(models[name]):
            raise CheckFailed(f"models[{name!r}] isn't a scikit-learn classifier.", actual=repr(models[name]))
        if hasattr(models[name], "classes_"):
            raise CheckFailed(f"models[{name!r}] has already been fitted. build_models hands back unfitted models.")
    for name in ("logistic", "neighbours"):
        model = models[name]
        if not (isinstance(model, Pipeline) and isinstance(model.steps[0][1], StandardScaler)):
            raise CheckFailed(f"models[{name!r}] should be a pipeline that starts with a StandardScaler.", actual=repr(model))
    k = models["neighbours"].steps[-1][1].get_params().get("n_neighbors")
    if k != 15:
        raise CheckFailed("build_models(15) should give the k-NN 15 neighbours.", expected=15, actual=k)


def cv_small(ctx):
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import cross_val_score
    from sklearn.tree import DecisionTreeClassifier

    mod = _module(ctx, "cross_validate")
    X, y = _small_data()
    models = {"stump": DecisionTreeClassifier(max_depth=1, random_state=0), "line": LogisticRegression()}
    got = mod.cross_validate(models, X, y, 5)
    if not isinstance(got, dict) or sorted(got) != ["line", "stump"]:
        raise CheckFailed("cross_validate should return a dict with one mean accuracy for each name it was given.",
                          expected=["line", "stump"], actual=repr(got)[:200])
    for name, model in models.items():
        want = cross_val_score(model, X, y, cv=5).mean()
        if abs(float(got[name]) - want) > 1e-9:
            raise CheckFailed(f"The mean over five folds for {name!r} is off.", expected=round(want, 4), actual=got[name])


def cv_folds(ctx):
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.model_selection import cross_val_score

    mod = _module(ctx, "cross_validate")
    X, y = _small_data(seed=8, n=60)
    model = KNeighborsClassifier(n_neighbors=3)
    got = mod.cross_validate({"near": model}, X, y, 3)
    want = cross_val_score(model, X, y, cv=3).mean()
    if abs(float(got["near"]) - want) > 1e-9:
        raise CheckFailed("With folds=3, use three folds, not five.", expected=round(want, 4), actual=got["near"])


def search_small(ctx):
    from sklearn.model_selection import GridSearchCV
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler

    mod = _module(ctx, "best_neighbours")
    X, y = _small_data(seed=11, n=120)
    choices = [1, 3, 7, 21]
    search = GridSearchCV(make_pipeline(StandardScaler(), KNeighborsClassifier()),
                          {"kneighborsclassifier__n_neighbors": choices}, cv=4).fit(X, y)
    want = search.best_params_["kneighborsclassifier__n_neighbors"]
    got = mod.best_neighbours(X, y, choices, 4)
    if got != want:
        raise CheckFailed("On these readings, the scaled k-NN does best with a different number of neighbours. Search the choices with a pipeline: StandardScaler, then KNeighborsClassifier.",
                          expected=want, actual=got)


def baseline(ctx):
    mod = _module(ctx, "always_commonest")
    got = float(mod.always_commonest(_np.array([0, 0, 1]), _np.array([0, 1, 1, 1])))
    if abs(got - 0.25) > 1e-9:
        raise CheckFailed("0 is commonest in training, so always guess 0: right on one test answer in four.", expected=0.25, actual=got)
    got = float(mod.always_commonest(_np.array([1, 1, 1, 0]), _np.array([1, 0, 1, 1, 1])))
    if abs(got - 0.8) > 1e-9:
        raise CheckFailed("Here 1 is commonest in training, so always guess 1.", expected=0.8, actual=got)


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


def best_k(ctx):
    _line(ctx, "Best number of neighbours:", "Best number of neighbours: 5",
          "Search 1, 5, 15, 25 and 45 neighbours with 5 folds, on the honest columns.")


def table(ctx):
    output = _output(ctx)
    for name, want in TABLE.items():
        found = _re.search(rf"^\s*{name}\s+(\d\.\d+)\s*$", output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line with {name} and its mean accuracy.", expected=f"{name:<12} {want:.3f}", actual=output)
        if abs(float(found.group(1)) - want) > 0.0015:
            raise CheckFailed(f"The cross-validated accuracy for {name} is off. Is it on the bookings without the leaky column, with 5 folds?",
                              expected=f"{name:<12} {want:.3f}", actual=found.group(0).strip())


def chosen(ctx):
    _line(ctx, "Chosen:", "Chosen: forest", "Choose the model with the highest cross-validated accuracy.")


def drawer(ctx):
    _line(ctx, "Bottom drawer accuracy:", "Bottom drawer accuracy: 0.77",
          "Fit the chosen model on every booking in bookings.csv, with the columns you kept, then score drawer.csv.")


def commonest(ctx):
    _line(ctx, "Always guessing the commonest:", "Always guessing the commonest: 0.71",
          "The baseline: guess the commonest answer in bookings.csv for every booking in the drawer.")


def by_group(ctx):
    _line(ctx, "outside", "outside  accuracy 0.35, slot given away 0.64",
          "On the drawer's bookings from outside the city: the accuracy, and the share of those who came but were predicted not to.")
    _line(ctx, "city", "city     accuracy 0.85, slot given away 0.09", "The same for the city's bookings.")


TESTS = [
    custom("group_report scores each group on its own", report_small, visible=True),
    custom("build_models(15) gives four unfitted models, scaled where it matters", four_models, visible=True),
    custom("given_away counts only the visitors who came", report_among_came,
           hint="Of the visitors who came, what share were predicted not to? The no-shows aren't in it."),
    custom("load_bookings reads 360 bookings", loads,
           hint="If only this fails, X is the FEATURES columns only: not the booking number, not outside, not came."),
    custom("alone_scores tries each column on its own", alone),
    custom("suspicious flags scores at or over the limit", flags),
    custom("cross_validate gives each model's mean accuracy over the folds", cv_small),
    custom("cross_validate uses the number of folds it's given", cv_folds,
           hint="If only this fails, pass folds to cv= rather than writing 5."),
    custom("best_neighbours searches with a scaled pipeline", search_small,
           hint="If only this fails, the parameter's name in the grid is the step's name, two underscores, then n_neighbors."),
    custom("always_commonest guesses training's commonest answer", baseline,
           hint="If only this fails, find the commonest answer in y_train, not in y_test."),
    custom("Prints each column's score alone", alone_table),
    custom("Drops the column that knows the answer", dropped),
    custom("Prints the best number of neighbours", best_k),
    custom("Prints each model's cross-validated accuracy", table),
    custom("Chooses by cross-validation", chosen),
    custom("Opens the bottom drawer once", drawer),
    custom("Compares with always guessing the commonest", commonest),
    custom("Reports by group", by_group),
]
