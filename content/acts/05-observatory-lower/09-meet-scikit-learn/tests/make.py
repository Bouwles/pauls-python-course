import re as _re

import numpy as _np

NEEDED = ("load_evenings", "best_neighbours", "build_models", "cross_validate", "always_commonest")
NAMES = ["logistic", "neighbours", "tree", "forest"]
TABLE = {"logistic": 0.908, "neighbours": 0.892, "tree": 0.875, "forest": 0.896}
_RUN = {}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"seeing.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _small_data(seed=4, n=90):
    rng = _np.random.default_rng(seed)
    X = rng.normal(size=(n, 3)) * _np.array([1.0, 50.0, 0.1])
    y = ((X[:, 0] + X[:, 1] / 50 + rng.normal(0, 0.7, n)) > 0).astype(int)
    return X, y


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


def loads(ctx):
    mod = _module(ctx, "load_evenings")
    result = mod.load_evenings("seeing.csv")
    try:
        X, y = result
    except (TypeError, ValueError):
        raise CheckFailed("load_evenings should return two things: X and y.", actual=repr(result)[:200])
    X, y = _np.asarray(X, dtype=float), _np.asarray(y)
    if X.shape != (320, 5) or y.shape != (320,):
        raise CheckFailed("320 evenings: X has 320 rows of 5 readings, y has 320 answers.",
                          expected="(320, 5) and (320,)", actual=f"{X.shape} and {y.shape}")
    if not (_np.allclose(X[0], [7, 74, 7, 1011, 22400]) and y[0] == 0):
        raise CheckFailed("The first evening is cloud 7, humidity 74, wind 7, pressure 1011, visibility 22400, not usable. The night number isn't a reading.",
                          expected="[7, 74, 7, 1011, 22400] and 0", actual=f"{X[0].tolist()} and {y[0]}")


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


def best_k(ctx):
    _line(ctx, "Best number of neighbours:", "Best number of neighbours: 5",
          "Search 1, 5, 15, 25 and 45 neighbours with 5 folds, on the training evenings only.")


def table(ctx):
    output = _output(ctx)
    for name, want in TABLE.items():
        found = _re.search(rf"^\s*{name}\s+(\d\.\d+)\s*$", output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line with {name} and its mean accuracy.", expected=f"{name:<12} {want:.3f}", actual=output)
        if abs(float(found.group(1)) - want) > 0.0015:
            raise CheckFailed(f"The cross-validated accuracy for {name} is off. Is it on the training evenings only, with 5 folds?",
                              expected=f"{name:<12} {want:.3f}", actual=found.group(0).strip())


def chosen(ctx):
    _line(ctx, "Chosen:", "Chosen: logistic", "Choose the model with the highest cross-validated accuracy.")


def tested(ctx):
    _line(ctx, "Test accuracy:", "Test accuracy: 0.938",
          "Fit the chosen model on all the training evenings, then score it on the test evenings, to three places.")


def commonest(ctx):
    _line(ctx, "Always guessing the commonest:", "Always guessing the commonest: 0.662",
          "The baseline: guess the commonest answer in training for every test evening.")


def beats_baseline(ctx):
    output = _output(ctx)
    test = _re.search(r"Test accuracy:\s*(\d\.\d+)", output)
    guess = _re.search(r"Always guessing the commonest:\s*(\d\.\d+)", output)
    if not (test and guess):
        raise CheckFailed("Print the test accuracy and the baseline, so they can be compared.", actual=output)
    if float(test.group(1)) < float(guess.group(1)) + 0.15:
        raise CheckFailed("On the test evenings, the chosen model should beat always guessing the commonest answer by a long way.",
                          expected=f"well over {guess.group(1)}", actual=test.group(1))


TESTS = [
    custom("build_models(15) gives four unfitted models, scaled where it matters", four_models, visible=True),
    custom("cross_validate gives each model's mean accuracy over the folds", cv_small, visible=True),
    custom("load_evenings reads 320 evenings", loads,
           hint="If only this fails, leave out the night number, and make y the last column."),
    custom("cross_validate uses the number of folds it's given", cv_folds,
           hint="If only this fails, pass folds to cv= rather than writing 5."),
    custom("best_neighbours searches with a scaled pipeline", search_small,
           hint="If only this fails, the parameter's name in the grid is the step's name, two underscores, then n_neighbors."),
    custom("always_commonest guesses training's commonest answer", baseline,
           hint="If only this fails, find the commonest answer in y_train, not in y_test."),
    custom("Prints the best number of neighbours", best_k),
    custom("Prints each model's cross-validated accuracy", table),
    custom("Chooses by cross-validation", chosen),
    custom("Opens the test evenings once", tested),
    custom("Compares with always guessing the commonest", commonest),
    custom("The chosen model beats the baseline on the test evenings", beats_baseline),
]
