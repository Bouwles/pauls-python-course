import numpy as _np


def _depth(tree):
    if not isinstance(tree, dict):
        raise CheckFailed("build_tree should still give back dicts: a leaf, or a question with left and right.", actual=repr(tree)[:200])
    if "leaf" in tree:
        return 0
    return 1 + max(_depth(tree["left"]), _depth(tree["right"]))


def _module(ctx):
    mod = ctx.module()
    if not callable(getattr(mod, "build_tree", None)):
        raise CheckFailed("dew_tree.py needs its build_tree function.")
    return mod


def stump(ctx):
    mod = _module(ctx)
    X = _np.array([[1.0, 5.0], [2.0, 1.0], [3.0, 4.0], [4.0, 2.0], [5.0, 3.0], [6.0, 6.0]])
    y = _np.array([0, 1, 0, 1, 1, 0])
    tree = mod.build_tree(X, y, max_depth=1)
    if _depth(tree) != 1:
        raise CheckFailed("With max_depth=1, the tree asks one question and stops: two leaves.", expected=1, actual=_depth(tree))


def depth_two(ctx):
    mod = _module(ctx)
    for limit in [0, 2, 4]:
        got = _depth(mod.build_tree(mod.X_train, mod.dew_train, max_depth=limit))
        if got > limit:
            raise CheckFailed(f"With max_depth={limit}, no path should ask more than {limit} questions.", expected=f"at most {limit}", actual=got)


TESTS = [
    output("Eight leaves at depth three", expect="Leaves: 8", match="contains", visible=True),
    custom("max_depth=1 asks one question", stump, visible=True),
    custom("No path deeper than max_depth", depth_two,
           hint="Each call one level down should know it's one level down."),
    output("Training accuracy", expect="Training accuracy: 0.91", match="contains"),
    output("Validation accuracy", expect="Validation accuracy: 0.96", match="contains"),
]
