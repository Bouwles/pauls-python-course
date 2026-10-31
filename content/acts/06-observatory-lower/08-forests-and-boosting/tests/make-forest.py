import numpy as _np


def _module(ctx, *names):
    mod = ctx.module()
    for name in names:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"loans.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _gini(y):
    if len(y) == 0:
        return 0.0
    shares = _np.bincount(y) / len(y)
    return 1 - _np.sum(shares ** 2)


def _best(X, y, features=None):
    best, best_score = None, _gini(y)
    for feature in range(X.shape[1]) if features is None else features:
        values = _np.unique(X[:, feature])
        for threshold in (values[:-1] + values[1:]) / 2:
            left = X[:, feature] <= threshold
            score = (left.sum() * _gini(y[left]) + (~left).sum() * _gini(y[~left])) / len(y)
            if score < best_score:
                best, best_score = (int(feature), float(threshold)), score
    return best


def _build(X, y, max_depth, depth=0, max_features=None, rng=None):
    features = None
    if max_features is not None:
        features = _np.sort(rng.choice(X.shape[1], max_features, replace=False))
    split = _best(X, y, features) if depth < max_depth else None
    if split is None:
        return {"leaf": int(_np.bincount(y).argmax())}
    feature, threshold = split
    left = X[:, feature] <= threshold
    return {"feature": feature, "threshold": threshold,
            "left": _build(X[left], y[left], max_depth, depth + 1, max_features, rng),
            "right": _build(X[~left], y[~left], max_depth, depth + 1, max_features, rng)}


def _same(got, want):
    if not isinstance(got, dict):
        return False
    if "leaf" in want:
        return "leaf" in got and int(got["leaf"]) == want["leaf"]
    return ("leaf" not in got and int(got["feature"]) == want["feature"] and abs(float(got["threshold"]) - want["threshold"]) < 1e-9
            and _same(got["left"], want["left"]) and _same(got["right"], want["right"]))


def _applicants(seed, n):
    rng = _np.random.default_rng(seed)
    X = _np.round(rng.uniform(0, 10, size=(n, 4)), 1)
    y = (((X[:, 0] < 4) & (X[:, 2] < 6)) ^ (rng.random(n) < 0.15)).astype(int)
    return X, y


def still_grows(ctx):
    mod = _module(ctx, "build_tree")
    X, y = _applicants(3, 50)
    if not _same(mod.build_tree(X, y, 3), _build(X, y, 3)):
        raise CheckFailed("With no max_features, build_tree should grow exactly the tree it grew before.")


def few_features(ctx):
    mod = _module(ctx, "build_tree")
    X, y = _applicants(4, 60)
    got = mod.build_tree(X, y, 4, max_features=2, rng=_np.random.default_rng(9))
    want = _build(X, y, 4, max_features=2, rng=_np.random.default_rng(9))
    if not _same(got, want):
        raise CheckFailed("With max_features=2, each question should consider np.sort(rng.choice(4, 2, replace=False)), drawn afresh for every question, in the order the tree grows: the question first, then the left side, then the right.")


def forest_matches(ctx):
    mod = _module(ctx, "build_tree", "fit_forest")
    X, y = _applicants(5, 60)
    got = mod.fit_forest(X, y, 4, 3, 2, _np.random.default_rng(11))
    rng = _np.random.default_rng(11)
    want = []
    for i in range(4):
        rows = rng.integers(0, len(X), len(X))
        want.append(_build(X[rows], y[rows], 3, max_features=2, rng=rng))
    if not isinstance(got, list) or len(got) != 4:
        raise CheckFailed("fit_forest(X, y, 4, ...) should give back a list of four trees.", actual=repr(got)[:200])
    for number, (g, w) in enumerate(zip(got, want), start=1):
        if not _same(g, w):
            raise CheckFailed(f"Tree {number} of the forest differs from Paul's. Draw each tree's rows from the one rng, then grow it with that rng.")


def trees_differ(ctx):
    mod = _module(ctx, "build_tree", "fit_forest")
    X, y = _applicants(6, 80)
    trees = mod.fit_forest(X, y, 5, 4, 2, _np.random.default_rng(2))
    if all(_same(tree, trees[0]) for tree in trees[1:]):
        raise CheckFailed("Every tree in the forest is the same tree. A forest of copies is one tree, five times.")


def share(ctx):
    mod = _module(ctx, "forest_share")
    trees = [{"leaf": 1}, {"leaf": 0}, {"feature": 0, "threshold": 2.0, "left": {"leaf": 1}, "right": {"leaf": 0}}, {"leaf": 1}]
    got = mod.forest_share(trees, _np.array([[1.0], [3.0]]))
    if got is None or _np.shape(got) != (2,) or not _np.allclose(got, [0.75, 0.5]):
        raise CheckFailed("Four trees: three say 1 for the first row, two for the second.", expected=[0.75, 0.5], actual=repr(got))


def costs(ctx):
    mod = _module(ctx, "cost")
    y = _np.array([1, 1, 0, 0, 1])
    got = float(mod.cost(_np.array([1, 0, 1, 0, 1]), y))
    if abs(got - 6 / 5) > 1e-9:
        raise CheckFailed("One bad loan approved costs 5, one good loan declined costs 1: 6 over 5 applicants.", expected=1.2, actual=got)


def _line(ctx, start, want, why):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    lines = [line.rstrip() for line in result.output.splitlines() if line.startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=result.output)
    if lines[-1].split() != want.split():
        raise CheckFailed(why, expected=want, actual=lines[-1])


def everyone(ctx):
    _line(ctx, "Approving everyone", "Approving everyone          0.645  1.775",
          "Approving everyone: right on every good loan, and 5 for every bad one.")


def one_tree(ctx):
    _line(ctx, "One tree", "One tree, depth 3           0.745  1.075", "The tree chosen by validation, on the test applicants.")


def the_forest(ctx):
    _line(ctx, "A forest", "A forest of 50 trees        0.740  1.200",
          "Fifty trees of depth 8, three columns per question, from the same rng as the split, approving when half or more say so.")


def boosting(ctx):
    _line(ctx, "Boosting", "Boosting, 100 rounds        0.750  1.130",
          "GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=2, random_state=0), fitted on the training applicants.")


def sure(ctx):
    _line(ctx, "The forest, 5 in 6 sure", "The forest, 5 in 6 sure     0.655  0.665",
          "Approve only when at least five trees in six say the loan will be repaid.")


TESTS = [
    custom("build_tree still grows the same tree", still_grows, visible=True),
    custom("forest_share of four trees", share, visible=True),
    custom("A few columns per question", few_features,
           hint="If only this fails, draw the columns at the start of every call of build_tree, before looking for the question."),
    custom("fit_forest grows Paul's trees", forest_matches,
           hint="If only this fails, use one rng for everything: the bootstrap rows, then that tree's columns."),
    custom("The forest's trees differ", trees_differ),
    custom("cost counts a bad loan five times", costs),
    custom("Approving everyone", everyone),
    custom("One tree", one_tree),
    custom("The forest", the_forest),
    custom("Boosting", boosting),
    custom("The forest, made sure", sure,
           hint="If only this fails, compare the forest's share with SURE, at or above it."),
]
