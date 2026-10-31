import re as _re

import numpy as _np

NEEDED = ("gini", "split_score", "best_split", "build_tree", "predict_one", "predict")
TABLE = [(1, 0.718, 0.700), (2, 0.747, 0.685), (3, 0.778, 0.735), (4, 0.793, 0.735),
         (5, 0.808, 0.715), (6, 0.838, 0.675), (8, 0.888, 0.680)]
TREE = """checking <= 1.5?
  yes: duration_months <= 22.5?
    yes: history <= 1.5?
      yes: decline
      no: approve
    no: savings <= 0.5?
      yes: decline
      no: approve
  no: amount <= 10924.5?
    yes: employment <= 2.5?
      yes: approve
      no: approve
    no: amount <= 12714.5?
      yes: decline
      no: approve"""


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"loans.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _number(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    return float(value)


def _gini(y):
    if len(y) == 0:
        return 0.0
    shares = _np.bincount(y) / len(y)
    return 1 - _np.sum(shares ** 2)


def _best(X, y):
    best, best_score = None, _gini(y)
    for feature in range(X.shape[1]):
        values = _np.unique(X[:, feature])
        for threshold in (values[:-1] + values[1:]) / 2:
            left = X[:, feature] <= threshold
            score = (left.sum() * _gini(y[left]) + (~left).sum() * _gini(y[~left])) / len(y)
            if score < best_score:
                best, best_score = (feature, float(threshold)), score
    return best


def _build(X, y, max_depth, depth=0):
    split = _best(X, y) if depth < max_depth else None
    if split is None:
        return {"leaf": int(_np.bincount(y).argmax())}
    feature, threshold = split
    left = X[:, feature] <= threshold
    return {"feature": feature, "threshold": threshold,
            "left": _build(X[left], y[left], max_depth, depth + 1),
            "right": _build(X[~left], y[~left], max_depth, depth + 1)}


def _depth(tree):
    if not isinstance(tree, dict) or not ("leaf" in tree or {"feature", "threshold", "left", "right"} <= set(tree)):
        raise CheckFailed('A tree is {"leaf": label}, or {"feature": f, "threshold": t, "left": tree, "right": tree}.', actual=repr(tree)[:200])
    if "leaf" in tree:
        return 0
    return 1 + max(_depth(tree["left"]), _depth(tree["right"]))


def _same(got, want):
    if "leaf" in want:
        return "leaf" in got and int(got["leaf"]) == want["leaf"]
    return ("leaf" not in got and int(got["feature"]) == want["feature"] and abs(float(got["threshold"]) - want["threshold"]) < 1e-9
            and _same(got["left"], want["left"]) and _same(got["right"], want["right"]))


def _applicants(seed, n):
    rng = _np.random.default_rng(seed)
    X = _np.round(rng.uniform(0, 10, size=(n, 3)), 1)
    y = (((X[:, 0] < 4) & (X[:, 1] < 6)) ^ (rng.random(n) < 0.1)).astype(int)
    return X, y


def gini_small(ctx):
    mod = _module(ctx, "gini")
    got = (_number(mod.gini(_np.array([1, 1, 0, 0])), "gini"), _number(mod.gini(_np.array([1, 1, 1])), "gini"))
    if abs(got[0] - 0.5) > 1e-9 or abs(got[1]) > 1e-9:
        raise CheckFailed("Half and half is 0.5; all one kind is 0.", expected=(0.5, 0.0), actual=got)


def best_small(ctx):
    mod = _module(ctx, "gini", "split_score", "best_split")
    got = mod.best_split(_np.array([[1.0], [2.0], [3.0], [4.0]]), _np.array([0, 0, 1, 1]))
    try:
        feature, threshold = got
    except (TypeError, ValueError):
        raise CheckFailed("best_split should return (feature, threshold).", actual=repr(got))
    if int(feature) != 0 or abs(float(threshold) - 2.5) > 1e-9:
        raise CheckFailed("Readings 1, 2, 3, 4 with labels 0, 0, 1, 1: ask whether the reading is at most 2.5.",
                          expected=(0, 2.5), actual=(feature, threshold))


def gini_quarter(ctx):
    mod = _module(ctx, "gini")
    got = _number(mod.gini(_np.array([1, 0, 0, 0])), "gini")
    if abs(got - 0.375) > 1e-9:
        raise CheckFailed("One default in four: 1 - 0.25 ** 2 - 0.75 ** 2.", expected=0.375, actual=got)


def weighted(ctx):
    mod = _module(ctx, "gini", "split_score")
    got = _number(mod.split_score(_np.array([0, 0, 1]), _np.array([1])), "split_score")
    if abs(got - 1 / 3) > 1e-9:
        raise CheckFailed("Three applicants with Gini 4/9 and one with Gini 0: (3 * 4/9 + 1 * 0) / 4.", expected=round(1 / 3, 4), actual=round(got, 4))


def best_second_feature(ctx):
    mod = _module(ctx, "gini", "split_score", "best_split")
    X = _np.array([[5.0, 1.0], [1.0, 2.0], [4.0, 8.0], [2.0, 9.0], [3.0, 3.0]])
    y = _np.array([1, 1, 0, 0, 1])
    got = mod.best_split(X, y)
    if got is None or int(got[0]) != 1 or abs(float(got[1]) - 5.5) > 1e-9:
        raise CheckFailed("The second column sorts these applicants perfectly at 5.5; the first can't.", expected=(1, 5.5), actual=repr(got))


def nothing_helps(ctx):
    mod = _module(ctx, "gini", "split_score", "best_split")
    pure = mod.best_split(_np.array([[1.0], [2.0], [3.0]]), _np.array([1, 1, 1]))
    same = mod.best_split(_np.array([[2.0, 7.0], [2.0, 7.0], [2.0, 7.0]]), _np.array([0, 1, 0]))
    if pure is not None or same is not None:
        raise CheckFailed("A pile all one kind, or applicants with identical answers, has no question worth asking: None.",
                          expected="None and None", actual=f"{pure!r} and {same!r}")


def first_wins_ties(ctx):
    mod = _module(ctx, "gini", "split_score", "best_split")
    X = _np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0]])
    got = mod.best_split(X, _np.array([0, 0, 1, 1]))
    if got is None or int(got[0]) != 0 or abs(float(got[1]) - 2.5) > 1e-9:
        raise CheckFailed("Both columns split these perfectly at 2.5. The first feature tried keeps the place.", expected=(0, 2.5), actual=repr(got))


def leaf_majority(ctx):
    mod = _module(ctx)
    X = _np.array([[1.0], [2.0], [3.0], [4.0], [5.0]])
    tree = mod.build_tree(X, _np.array([1, 0, 1, 1, 0]), 0)
    tie = mod.build_tree(X[:4], _np.array([1, 0, 0, 1]), 0)
    if not (isinstance(tree, dict) and tree.get("leaf") == 1 and isinstance(tie, dict) and tie.get("leaf") == 0):
        raise CheckFailed("With max_depth 0, a single leaf with the commonest label; on a tie, the smaller label.",
                          expected='{"leaf": 1} and {"leaf": 0}', actual=f"{tree!r} and {tie!r}")


def stump(ctx):
    mod = _module(ctx)
    X = _np.array([[1.0], [2.0], [3.0], [4.0], [5.0], [6.0]])
    tree = mod.build_tree(X, _np.array([0, 0, 1, 0, 1, 1]), 1)
    want = {"feature": 0, "threshold": 2.5, "left": {"leaf": 0}, "right": {"leaf": 1}}
    if _depth(tree) != 1 or not _same(tree, want):
        raise CheckFailed("With max_depth 1, one question and two leaves.", expected=repr(want), actual=repr(tree)[:300])


def grows_like_paul(ctx):
    mod = _module(ctx)
    X, y = _applicants(11, 60)
    for limit in [2, 4, 10]:
        want = _build(X, y, limit)
        got = mod.build_tree(X, y, limit)
        if _depth(got) > limit:
            raise CheckFailed(f"With max_depth {limit}, no path should ask more than {limit} questions.", expected=f"at most {limit}", actual=_depth(got))
        if not _same(got, want):
            raise CheckFailed(f"On sixty applicants of the checks' own, max_depth {limit}, the tree asks different questions from Paul's.")


def predicts(ctx):
    mod = _module(ctx, "predict_one", "predict")
    tree = {"feature": 0, "threshold": 2.0, "left": {"leaf": 1},
            "right": {"feature": 1, "threshold": 5.0, "left": {"leaf": 0}, "right": {"leaf": 1}}}
    rows = _np.array([[1.0, 9.0], [2.0, 0.0], [3.0, 4.0], [3.0, 6.0]])
    got = mod.predict(tree, rows)
    if got is None or _np.shape(got) != (4,) or [int(v) for v in got] != [1, 1, 0, 1]:
        raise CheckFailed("Follow the questions: a reading equal to the threshold goes left, the yes side.", expected=[1, 1, 0, 1], actual=repr(got))


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Grow the tree from scratch. scikit-learn comes in for boosting, in the next step.")


def table(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    rows = {}
    for line in result.output.splitlines():
        found = _re.match(r"^\s*(\d+)\s+(\d\.\d+)\s+(\d\.\d+)\s*$", line)
        if found:
            rows[int(found.group(1))] = (float(found.group(2)), float(found.group(3)))
    for depth, training, validation in TABLE:
        if depth not in rows:
            raise CheckFailed(f"There's no row for depth {depth}: the depth, then the training accuracy, then the validation accuracy.",
                              expected=f"{depth:5}  {training:8.3f}  {validation:10.3f}", actual=result.output)
        got_training, got_validation = rows[depth]
        if abs(got_training - training) > 0.0015 or abs(got_validation - validation) > 0.0015:
            raise CheckFailed(f"The accuracies for depth {depth} are off. Is the split exactly as the requirements say?",
                              expected=f"{depth:5}  {training:8.3f}  {validation:10.3f}",
                              actual=f"{depth:5}  {got_training:8.3f}  {got_validation:10.3f}")


def chosen_tree(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    if TREE not in result.output:
        raise CheckFailed("Show the tree grown to the chosen depth on the training applicants, with show(tree, FEATURES).",
                          expected=TREE, actual=result.output)


TESTS = [
    custom("gini of a half-and-half pile and a pure one", gini_small, visible=True),
    custom("best_split finds column <= 2.5", best_small, visible=True),
    custom("gini of one default in four", gini_quarter),
    custom("split_score weights each side by its size", weighted,
           hint="If only this fails, multiply each side's Gini by its number of applicants, add, and divide by the total."),
    custom("best_split tries every column", best_second_feature),
    custom("best_split gives None when nothing helps", nothing_helps,
           hint="If only this fails, start best_score at gini(y), and only accept a question that scores lower."),
    custom("On a tie, the first question tried wins", first_wins_ties,
           hint="If only this fails, replace the best only when a score is strictly lower: < not <=."),
    custom("A leaf holds the commonest label", leaf_majority),
    custom("max_depth 1 grows one question", stump),
    custom("Grows the same tree as Paul's on other applicants", grows_like_paul,
           hint="If only this fails, check the stopping rules: depth reaches max_depth, or best_split gives None."),
    custom("predict follows the questions", predicts),
    custom("Grown from scratch", no_library),
    custom("Prints the validation table", table),
    output("Chooses a depth", expect="Chosen depth: 3", match="contains"),
    custom("Shows the chosen tree", chosen_tree),
    output("Opens the test applicants once", expect="Test accuracy: 0.745", match="contains"),
    output("Against approving everyone", expect="Approving everyone: 0.645", match="contains"),
    output("Only two depths to choose from", set_vars={"DEPTHS": [1, 2]}, expect="Chosen depth: 1", match="contains",
           hint="If only this fails, choose from DEPTHS, and on a tie keep the shallower tree, the first."),
]
