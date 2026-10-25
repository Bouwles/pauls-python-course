import re as _re

import numpy as _np

NEEDED = ("mse", "bootstrap", "fit_forest", "predict_forest", "fit_boosting", "predict_boosting")


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"forest.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _array(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    return _np.asarray(value, dtype=float)


def _nights(seed, n):
    rng = _np.random.default_rng(seed)
    X = _np.round(rng.uniform(0, 10, size=(n, 3)), 1)
    y = _np.sin(X[:, 0]) + 0.3 * X[:, 1] + rng.normal(0, 0.2, n)
    return X, y


def _reference_forest(tree_module, X, y, n_trees, max_depth, max_features, rng):
    trees = []
    for i in range(n_trees):
        rows = rng.integers(0, len(X), len(X))
        trees.append(tree_module.fit_tree(X[rows], y[rows], max_depth, max_features, rng))
    return _np.mean([tree_module.predict_tree(tree, X) for tree in trees], axis=0)


def _boost(ctx, mod, X, y, rounds, rate, depth):
    model = mod.fit_boosting(X, y, rounds, rate, depth)
    if not isinstance(model, dict) or not {"start", "rate", "trees"} <= set(model):
        raise CheckFailed('fit_boosting should return {"start": ..., "rate": ..., "trees": [...]}.', actual=repr(model)[:200])
    return model


def _tree_module(mod):
    if callable(getattr(mod, "fit_tree", None)) and callable(getattr(mod, "predict_tree", None)):
        return mod
    import sys
    return sys.modules["tree"]


def handmade_forest(ctx):
    mod = _module(ctx, "predict_forest")
    got = _array(mod.predict_forest([{"value": 1.0}, {"value": 3.0}, {"value": 2.0}], _np.zeros((4, 2))), "predict_forest")
    if got.shape != (4,) or not _np.allclose(got, 2.0):
        raise CheckFailed("Three trees answering 1, 3 and 2 everywhere: the forest says 2 for every row.", expected=[2.0] * 4, actual=got.tolist())


def handmade_boost(ctx):
    mod = _module(ctx, "predict_boosting")
    model = {"start": 1.0, "rate": 0.5, "trees": [{"value": 2.0}, {"value": -1.0}]}
    got = _array(mod.predict_boosting(model, _np.zeros((3, 2))), "predict_boosting")
    if got.shape != (3,) or not _np.allclose(got, 1.5):
        raise CheckFailed("Start at 1, add 0.5 * 2, add 0.5 * -1.", expected=[1.5] * 3, actual=got.tolist())


def bootstrap_draws(ctx):
    mod = _module(ctx, "bootstrap")
    got = _np.asarray(mod.bootstrap(12, _np.random.default_rng(3)))
    want = _np.random.default_rng(3).integers(0, 12, 12)
    if got.shape != (12,) or not _np.array_equal(got, want):
        raise CheckFailed("Twelve positions, drawn with rng.integers(0, n, n).", expected=want.tolist(), actual=got.tolist())


def forest_matches(ctx):
    mod = _module(ctx, "bootstrap", "fit_forest", "predict_forest")
    tree_module = _tree_module(mod)
    X, y = _nights(5, 40)
    trees = mod.fit_forest(X, y, 6, 4, 2, _np.random.default_rng(9))
    if not isinstance(trees, list) or len(trees) != 6:
        raise CheckFailed("fit_forest should return a list with one tree for each of n_trees.", expected=6, actual=repr(trees)[:100])
    got = _array(mod.predict_forest(trees, X), "predict_forest")
    want = _reference_forest(tree_module, X, y, 6, 4, 2, _np.random.default_rng(9))
    if not _np.allclose(got, want):
        raise CheckFailed("On nights of the checks' own, the forest differs from Moss's. For each tree: bootstrap with rng, then fit_tree with the same rng.")


def trees_differ(ctx):
    mod = _module(ctx, "bootstrap", "fit_forest")
    tree_module = _tree_module(mod)
    X, y = _nights(6, 40)
    trees = mod.fit_forest(X, y, 2, 6, 2, _np.random.default_rng(4))
    if _np.allclose(tree_module.predict_tree(trees[0], X), tree_module.predict_tree(trees[1], X)):
        raise CheckFailed("Two trees in the forest give identical answers. Each should grow on its own bootstrap sample.")


def boost_start(ctx):
    mod = _module(ctx, "fit_boosting", "predict_boosting")
    X, y = _nights(7, 30)
    model = _boost(ctx, mod, X, y, 0, 0.1, 2)
    got = _array(mod.predict_boosting(model, X[:3]), "predict_boosting")
    if abs(float(model["start"]) - y.mean()) > 1e-9 or not _np.allclose(got, y.mean()):
        raise CheckFailed("With no rounds at all, boosting is just the mean.", expected=round(float(y.mean()), 4), actual=_np.round(got, 4).tolist())


def boost_matches(ctx):
    mod = _module(ctx, "fit_boosting", "predict_boosting")
    tree_module = _tree_module(mod)
    X, y = _nights(8, 40)
    prediction = _np.full(len(y), y.mean())
    for i in range(15):
        prediction = prediction + 0.2 * tree_module.predict_tree(tree_module.fit_tree(X, y - prediction, 2), X)
    model = _boost(ctx, mod, X, y, 15, 0.2, 2)
    got = _array(mod.predict_boosting(model, X), "predict_boosting")
    if len(model["trees"]) != 15 or not _np.allclose(got, prediction):
        raise CheckFailed("Fifteen rounds at a rate of 0.2: each tree fitted to y minus the prediction so far.",
                          expected=_np.round(prediction[:4], 4).tolist(), actual=_np.round(got[:4], 4).tolist())


def boost_error_falls(ctx):
    mod = _module(ctx, "fit_boosting", "predict_boosting")
    X, y = _nights(9, 40)
    errors = []
    for rounds in [1, 5, 20, 60]:
        model = _boost(ctx, mod, X, y, rounds, 0.1, 2)
        errors.append(float(_np.mean((mod.predict_boosting(model, X) - y) ** 2)))
    if not all(later < earlier for earlier, later in zip(errors, errors[1:])):
        raise CheckFailed("On the training nights, more rounds should always mean a lower error.", expected="falling", actual=_np.round(errors, 4).tolist())


def beat_one_tree(ctx):
    mod = _module(ctx)
    tree_module = _tree_module(mod)
    X, y = _nights(10, 160)
    X_new, y_new = _nights(11, 80)
    one = _np.mean((tree_module.predict_tree(tree_module.fit_tree(X, y, 8), X_new) - y_new) ** 2)
    forest = _np.mean((mod.predict_forest(mod.fit_forest(X, y, 25, 8, 2, _np.random.default_rng(1)), X_new) - y_new) ** 2)
    boosted = _np.mean((mod.predict_boosting(_boost(ctx, mod, X, y, 80, 0.1, 2), X_new) - y_new) ** 2)
    if not (forest < one and boosted < one):
        raise CheckFailed("On new nights, both ensembles should beat one deep tree.",
                          expected=f"both under {one:.3f}", actual=f"forest {forest:.3f}, boosting {boosted:.3f}")


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Build them from scratch with Moss's tree. scikit-learn comes in the next job.")


def _line(label, value):
    def check(ctx):
        result = ctx.run_program()
        if result.error is not None:
            raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
        found = _re.search(rf"^{_re.escape(label)}\s+(\d+\.\d+)\s*$", result.output, _re.M)
        if not found:
            raise CheckFailed(f"There's no line starting {label!r} with its test error.", expected=f"{label:<22} {value}", actual=result.output)
        if found.group(1) != value:
            raise CheckFailed(f"The test error for {label.lower()} is off.", expected=f"{label:<22} {value}", actual=found.group(0))
    return check


TESTS = [
    custom("A forest of three handmade trees", handmade_forest, visible=True),
    custom("Boosting with two handmade trees", handmade_boost, visible=True),
    custom("bootstrap draws with rng.integers", bootstrap_draws),
    custom("fit_forest grows the same forest as Moss's", forest_matches,
           hint="If only this fails, keep the order: for each tree, bootstrap(len(X), rng), then fit_tree(X[rows], y[rows], max_depth, max_features, rng)."),
    custom("No two trees alike", trees_differ),
    custom("No rounds, just the mean", boost_start),
    custom("fit_boosting matches boosting by hand", boost_matches,
           hint="If only this fails, fit each tree to y minus the prediction so far, and add rate times its predictions."),
    custom("More rounds, lower training error", boost_error_falls),
    custom("Both ensembles beat one tree on new nights", beat_one_tree),
    custom("Built from scratch", no_library),
    custom("Guessing the mean", _line("Guessing the mean", "0.611")),
    custom("One deep tree", _line("One deep tree", "0.191")),
    custom("A forest of 50 trees", _line("A forest of 50 trees", "0.113")),
    custom("Boosting, 100 rounds", _line("Boosting, 100 rounds", "0.082")),
    output("Ten trees and twenty rounds", set_vars={"TREES": 10, "ROUNDS": 20},
           expect="A forest of 10 trees   0.139\nBoosting, 20 rounds    0.168", match="contains",
           hint="If only this fails, use TREES and ROUNDS, not 50 and 100 written in again."),
]
