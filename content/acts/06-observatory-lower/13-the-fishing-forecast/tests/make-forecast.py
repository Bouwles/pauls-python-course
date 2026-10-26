import re as _re

import numpy as _np

NEEDED = ("split_by_year", "ferros_rule", "always_commonest", "candidate_models", "cross_validated", "precision_recall")
NAMES = ["boosting", "forest", "logistic"]
TABLE = {"logistic": 0.860, "forest": 0.842, "boosting": 0.853}
_RUN = {}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"forecast.py needs a function called {name}. The list is in the step.")
    return mod


def _frame():
    import pandas as pd
    return pd.DataFrame({
        "date": ["2024-12-30", "2024-12-31", "2025-01-01", "2025-06-15", "2026-01-01"],
        "tide_range": [4.5, 3.2, 4.0, 4.4, 4.1],
        "wind_speed": [12, 8, 19, 20, 30],
    })


def split(ctx):
    mod = _module(ctx, "split_by_year")
    result = mod.split_by_year(_frame(), 2025)
    try:
        train, test = result
    except (TypeError, ValueError):
        raise CheckFailed("split_by_year should return two DataFrames: the days before that year, and the days in it.", actual=repr(result)[:200])
    if list(train["date"]) != ["2024-12-30", "2024-12-31"] or list(test["date"]) != ["2025-01-01", "2025-06-15"]:
        raise CheckFailed("Training is every day before 2025; testing is the days in 2025, and not 2026.",
                          expected="train: the two 2024 days, test: the two 2025 days",
                          actual=f"train: {list(train['date'])}, test: {list(test['date'])}")


def rule(ctx):
    mod = _module(ctx, "ferros_rule")
    got = mod.ferros_rule(_frame())
    if got is None or _np.asarray(got).tolist() != [1, 0, 1, 0, 0]:
        raise CheckFailed("A range of 4.0 m or more and a wind under 20 knots. 4.0 counts; 20 knots doesn't.",
                          expected=[1, 0, 1, 0, 0], actual=None if got is None else _np.asarray(got).tolist())


def commonest(ctx):
    mod = _module(ctx, "always_commonest")
    got = float(mod.always_commonest(_np.array([0, 0, 1]), _np.array([1, 1, 0, 1])))
    if abs(got - 0.25) > 1e-9:
        raise CheckFailed("0 is commonest in training, so always guess 0.", expected=0.25, actual=got)
    got = float(mod.always_commonest(_np.array([1, 1, 0]), _np.array([1, 1, 0, 1])))
    if abs(got - 0.75) > 1e-9:
        raise CheckFailed("Here 1 is commonest in training.", expected=0.75, actual=got)


def models(ctx):
    from sklearn.base import is_classifier
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    mod = _module(ctx, "candidate_models")
    got = mod.candidate_models()
    if not isinstance(got, dict) or sorted(got) != NAMES:
        raise CheckFailed("Three unfitted models, by name.", expected=NAMES, actual=sorted(got) if isinstance(got, dict) else repr(got)[:200])
    for name, model in got.items():
        if not is_classifier(model) or hasattr(model, "classes_"):
            raise CheckFailed(f"models[{name!r}] should be an unfitted scikit-learn classifier.", actual=repr(model))
    logistic = got["logistic"]
    if not (isinstance(logistic, Pipeline) and isinstance(logistic.steps[0][1], StandardScaler)):
        raise CheckFailed("The logistic regression needs its scaler inside a pipeline.", actual=repr(logistic))


def cv(ctx):
    from sklearn.model_selection import cross_val_score
    from sklearn.tree import DecisionTreeClassifier

    mod = _module(ctx, "cross_validated")
    rng = _np.random.default_rng(6)
    X = rng.normal(size=(80, 3))
    y = (X[:, 0] - X[:, 2] + rng.normal(0, 0.6, 80) > 0).astype(int)
    stump = DecisionTreeClassifier(max_depth=1, random_state=0)
    got = mod.cross_validated({"stump": stump}, X, y, 4)
    want = cross_val_score(stump, X, y, cv=4).mean()
    if not isinstance(got, dict) or abs(float(got.get("stump", -1)) - want) > 1e-9:
        raise CheckFailed("Each model's mean accuracy over the folds given.", expected={"stump": round(want, 4)}, actual=repr(got)[:200])


def pr(ctx):
    mod = _module(ctx, "precision_recall")
    result = mod.precision_recall(_np.array([1, 1, 1, 0, 0, 1]), _np.array([1, 0, 1, 1, 0, 0]))
    try:
        precision, recall = result
    except (TypeError, ValueError):
        raise CheckFailed("precision_recall should return two numbers.", actual=repr(result)[:200])
    if abs(float(precision) - 2 / 3) > 1e-9 or abs(float(recall) - 0.5) > 1e-9:
        raise CheckFailed("It said good three times and was right twice: precision 2/3. Of four good days it caught two: recall 1/2.",
                          expected="(0.667, 0.5)", actual=f"({float(precision):.3f}, {float(recall):.3f})")


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


def counts(ctx):
    _line(ctx, "Training days:", "Training days: 730, test days: 365",
          "2023 and 2024 to learn from, less the first day, which has no pressure change; all of 2025 to test.")


def table(ctx):
    output = _output(ctx)
    for name, want in TABLE.items():
        found = _re.search(rf"^\s*{name}\s+(\d\.\d+)\s*$", output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line with {name} and its cross-validated accuracy.", expected=f"{name:<10} {want:.3f}", actual=output)
        if abs(float(found.group(1)) - want) > 0.0015:
            raise CheckFailed(f"{name}'s cross-validated accuracy is off. Five folds, on 2023 and 2024 only, with the ten FEATURES.",
                              expected=f"{name:<10} {want:.3f}", actual=found.group(0).strip())


def chosen(ctx):
    _line(ctx, "Chosen:", "Chosen: logistic", "Choose by cross-validated accuracy.")


def tested(ctx):
    _line(ctx, "On 2025:", "On 2025: 0.852", "Fit the chosen model on all the training days, then score it on 2025, once.")


def baselines(ctx):
    _line(ctx, "Ferro's rule:", "Ferro's rule: 0.723", "Score Ferro's rule on the 2025 days.")
    _line(ctx, "Always saying no:", "Always saying no: 0.575", "Score always guessing training's commonest answer on 2025.")


def costs(ctx):
    _line(ctx, "When it says good, it's right:", "When it says good, it's right: 0.81", "Precision on 2025: of the days it said good, the share that were.")
    _line(ctx, "Good days it caught:", "Good days it caught: 0.85", "Recall on 2025: of the good days, the share it said good.")


def beats_baselines(ctx):
    output = _output(ctx)
    found = {label: _re.search(rf"{label}:\s*(\d\.\d+)", output) for label in ("On 2025", "Ferro's rule", "Always saying no")}
    if not all(found.values()):
        raise CheckFailed("Print the model's 2025 score beside both baselines.", actual=output)
    model, rule, guess = (float(found[label].group(1)) for label in ("On 2025", "Ferro's rule", "Always saying no"))
    if not (model >= rule + 0.08 and model >= guess + 0.2):
        raise CheckFailed("On 2025, a year it never saw, the forecast should clearly beat Ferro's rule and always saying no.",
                          expected=f"well over {rule:.3f} and {guess:.3f}", actual=f"{model:.3f}")


TESTS = [
    custom("split_by_year locks one year away", split, visible=True),
    custom("ferros_rule: spring tide and under twenty knots", rule, visible=True),
    custom("always_commonest guesses training's commonest answer", commonest),
    custom("candidate_models gives three unfitted models", models),
    custom("cross_validated gives each model's mean accuracy", cv),
    custom("precision_recall for the good days", pr,
           hint="If only this fails: precision counts among the days it said good; recall among the days that were good."),
    custom("Counts the days on each side", counts),
    custom("Prints each model's cross-validated accuracy", table),
    custom("Chooses by cross-validation", chosen),
    custom("Opens 2025 once", tested),
    custom("Scores both baselines on 2025", baselines),
    custom("Prints precision and recall", costs),
    custom("Beats both baselines on the held-out year", beats_baselines),
]
