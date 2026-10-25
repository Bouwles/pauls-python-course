import numpy as _np


def _module(ctx):
    mod = ctx.module()
    for name in ("fit_forest", "predict_forest"):
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"grove.py needs its {name} function.")
    return mod


def _error(mod, trees):
    return float(_np.mean((mod.predict_forest(trees, mod.X_test) - mod.y_test) ** 2))


def trees_differ(ctx):
    mod = _module(ctx)
    trees = mod.fit_forest(mod.X_train, mod.y_train, n_trees=3)
    first, second = mod.predict_tree(trees[0], mod.X_test), mod.predict_tree(trees[1], mod.X_test)
    if _np.allclose(first, second):
        raise CheckFailed("The first two trees give identical answers on every test night. Each tree needs its own bootstrap sample.")


def other_seeds(ctx):
    mod = _module(ctx)
    for seed, want in [(3, 0.1011), (11, 0.1265)]:
        got = _error(mod, mod.fit_forest(mod.X_train, mod.y_train, n_trees=20, seed=seed))
        if abs(got - want) > 1e-4:
            raise CheckFailed(f"Twenty trees from seed {seed}: one generator for the whole forest, made once.",
                              expected=want, actual=round(got, 4))


TESTS = [
    output("Fifty different trees", expect="Forest of 50 trees:  0.1080", match="contains", visible=True),
    custom("No two trees alike", trees_differ, visible=True),
    output("One deep tree is unchanged", expect="One deep tree:       0.1906", match="contains"),
    custom("Forests from other seeds", other_seeds,
           hint="If only this fails, make the generator once, from seed, before the loop, and use it for every tree."),
]
