import re as _re

import numpy as _np

NEEDED = ("distances", "nearest", "vote", "predict", "accuracy", "choose_k")
TABLE = [(1, 0.966, 0.721), (3, 0.879, 0.779), (5, 0.854, 0.838), (7, 0.830, 0.838),
         (9, 0.796, 0.868), (11, 0.796, 0.853), (15, 0.796, 0.853), (21, 0.791, 0.809)]


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"classifier.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _array(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it print the answer instead of returning it?")
    return _np.asarray(value)


def _reference(X_train, labels, X_new, k):
    out = []
    for point in X_new:
        order = _np.argsort(_np.sqrt(((X_train - point) ** 2).sum(axis=1)), kind="stable")[:k]
        counts = {}
        for label in labels[order]:
            counts[label] = counts.get(label, 0) + 1
        best = max(counts.values())
        out.append(next(label for label in labels[order] if counts[label] == best))
    return _np.array(out)


def _animals(seed, n):
    rng = _np.random.default_rng(seed)
    X = rng.normal(size=(n, 3))
    labels = _np.where(X[:, 0] + rng.normal(0, 0.6, n) > 0.4, "Gentoo", _np.where(X[:, 1] > 0, "Chinstrap", "Adelie"))
    return X, labels


def euclidean(ctx):
    mod = _module(ctx, "distances")
    got = _array(mod.distances(_np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 1.0]]), _np.array([0.0, 0.0])), "distances").astype(float)
    if got.shape != (3,) or not _np.allclose(got, [0.0, 5.0, 2 ** 0.5]):
        raise CheckFailed("One straight-line distance per row.", expected=[0.0, 5.0, 1.414], actual=_np.round(got, 3).tolist())


def vote_simple(ctx):
    mod = _module(ctx, "vote")
    got = mod.vote(_np.array(["Gentoo", "Adelie", "Gentoo"]))
    if got != "Gentoo":
        raise CheckFailed("Two Gentoos beat one Adelie.", expected="Gentoo", actual=repr(got))


def manhattan(ctx):
    mod = _module(ctx, "distances")
    got = _array(mod.distances(_np.array([[0.0, 0.0], [3.0, 4.0], [1.0, -1.0]]), _np.array([0.0, 0.0]), "manhattan"), "distances").astype(float)
    if got.shape != (3,) or not _np.allclose(got, [0.0, 7.0, 2.0]):
        raise CheckFailed("Manhattan distance adds up the plain differences: 3 + 4, and 1 + 1.", expected=[0.0, 7.0, 2.0], actual=got.tolist())


def nearest_order(ctx):
    mod = _module(ctx, "distances", "nearest")
    X = _np.array([[1.0, 0.0], [0.0, 1.0], [3.0, 0.0], [0.0, 0.5], [2.0, 2.0]])
    got = _array(mod.nearest(X, _np.array([0.0, 0.0]), 3), "nearest")
    if got.shape != (3,) or got.tolist() != [3, 0, 1]:
        raise CheckFailed("Distances 1, 1, 3, 0.5 and 2.8: nearest first, and the two at 1 in their own order.",
                          expected=[3, 0, 1], actual=got.tolist())


def vote_tie(ctx):
    mod = _module(ctx, "vote")
    got = mod.vote(_np.array(["Adelie", "Gentoo", "Gentoo", "Adelie", "Chinstrap"]))
    if got != "Adelie":
        raise CheckFailed("Two Adelies and two Gentoos: the tie goes to the label of the nearest animal, which comes first.",
                          expected="Adelie", actual=repr(got))


def predict_small(ctx):
    mod = _module(ctx, "distances", "nearest", "vote", "predict")
    X_train = _np.array([[0.0, 0.0], [0.2, 0.1], [5.0, 5.0], [5.1, 4.9], [4.8, 5.2]])
    labels = _np.array(["Adelie", "Adelie", "Gentoo", "Gentoo", "Chinstrap"])
    got = _array(mod.predict(X_train, labels, _np.array([[0.1, 0.0], [5.0, 5.1], [4.9, 5.1]]), 3), "predict")
    if got.shape != (3,) or got.tolist() != ["Adelie", "Gentoo", "Gentoo"]:
        raise CheckFailed("One answer per new animal, each the vote of its three nearest.",
                          expected=["Adelie", "Gentoo", "Gentoo"], actual=got.tolist())


def predict_matches(ctx):
    mod = _module(ctx, "distances", "nearest", "vote", "predict")
    X_train, labels = _animals(4, 60)
    X_new, _ = _animals(5, 25)
    for k in [1, 4, 7]:
        want = _reference(X_train, labels, X_new, k)
        got = _array(mod.predict(X_train, labels, X_new, k), "predict")
        if got.shape != want.shape or not _np.array_equal(got, want):
            raise CheckFailed(f"On measurements of the checks' own, k = {k}, some answers differ.",
                              expected=want.tolist(), actual=got.tolist())


def remembers_itself(ctx):
    mod = _module(ctx, "distances", "nearest", "vote", "predict")
    X_train, labels = _animals(6, 30)
    got = _array(mod.predict(X_train, labels, X_train, 1), "predict")
    if not _np.array_equal(got, labels):
        raise CheckFailed("With k = 1, every training animal's nearest animal is itself, when no two share the same measurements.", expected=labels.tolist(), actual=got.tolist())


def accuracy_share(ctx):
    mod = _module(ctx, "accuracy")
    got = float(mod.accuracy(_np.array(["Gentoo", "Adelie", "Chinstrap", "Gentoo"]), _np.array(["Gentoo", "Chinstrap", "Chinstrap", "Adelie"])))
    if abs(got - 0.5) > 1e-9:
        raise CheckFailed("Two of four match.", expected=0.5, actual=got)


def choose_small(ctx):
    mod = _module(ctx)
    X_train, labels = _animals(7, 50)
    X_val, val_labels = _animals(8, 30)
    ks = [1, 3, 5, 7, 9, 13]
    scores = [_np.mean(_reference(X_train, labels, X_val, k) == val_labels) for k in ks]
    want = ks[int(_np.argmax(scores))]
    got = mod.choose_k(X_train, labels, X_val, val_labels, ks)
    if got != want:
        raise CheckFailed(f"Validation accuracies {_np.round(scores, 3).tolist()} for k in {ks}: the first best is k = {want}.",
                          expected=want, actual=got)


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Build it from scratch with NumPy. scikit-learn's KNeighborsClassifier would do it for you, which isn't the point yet.")


def table(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    rows = {}
    for line in result.output.splitlines():
        found = _re.match(r"^\s*(\d+)\s+(\d\.\d+)\s+(\d\.\d+)\s*$", line)
        if found:
            rows[int(found.group(1))] = (float(found.group(2)), float(found.group(3)))
    for k, training, validation in TABLE:
        if k not in rows:
            raise CheckFailed(f"There's no row for k = {k}: k, then the training accuracy, then the validation accuracy.",
                              expected=f"{k:2}  {training:8.3f}  {validation:10.3f}", actual=result.output)
        got_training, got_validation = rows[k]
        if abs(got_training - training) > 0.0015 or abs(got_validation - validation) > 0.0015:
            raise CheckFailed(f"The accuracies for k = {k} are off. Is the split exactly as the requirements say, and everything scaled with the training rows' ruler?",
                              expected=f"{k:2}  {training:8.3f}  {validation:10.3f}",
                              actual=f"{k:2}  {got_training:8.3f}  {got_validation:10.3f}")


TESTS = [
    custom("distances from (0, 0)", euclidean, visible=True),
    custom("vote of Gentoo, Adelie, Gentoo", vote_simple, visible=True),
    custom("Manhattan distance", manhattan),
    custom("nearest gives positions, nearest first", nearest_order,
           hint="If only this fails, return positions with np.argsort(..., kind=\"stable\"), not the distances themselves."),
    custom("A tied vote goes to the nearest", vote_tie,
           hint="If only this fails, on a tie pick the tied label that appears first: Counter's most_common keeps first-seen order."),
    custom("predict gives one answer per animal", predict_small),
    custom("predict matches nearest neighbours on other measurements", predict_matches),
    custom("With k = 1 it remembers every training animal", remembers_itself),
    custom("accuracy is the share that match", accuracy_share),
    custom("choose_k picks by validation", choose_small,
           hint="If only this fails, score each k on the validation rows and give back the k, not its position."),
    custom("Built from scratch", no_library),
    custom("Prints the table for every k", table),
    output("Chooses k", expect="Chosen k: 9", match="contains"),
    output("Opens the test penguins once", expect="Test accuracy: 0.81", match="contains"),
    output("Names the new penguin", expect="New: Gentoo, like 8 of the 9 nearest", match="contains",
           hint="Scale NEW with the training rows' means and spreads, and let the chosen k neighbours vote."),
    output("Only three ks to choose from", set_vars={"KS": [1, 3, 5]}, expect="Chosen k: 5", match="contains",
           hint="If only this fails, choose from KS, not from a list written in again."),
    output("A small penguin", set_vars={"NEW": [190.0, 3700.0]},
           expect="New: Adelie, like 7 of the 9 nearest", match="contains"),
    output("A penguin between the two", set_vars={"NEW": [197.0, 3800.0]},
           expect="New: Chinstrap, like 6 of the 9 nearest", match="contains"),
    output("The same code on Fisher's irises", set_vars={"DATASET": "iris.csv", "MEASUREMENTS": ["sepal_length", "sepal_width", "petal_length", "petal_width"], "NEW": [6.1, 2.8, 4.9, 1.7]},
           expect="New: versicolor, like 3 of the 5 nearest", match="contains",
           hint="If only this fails, load DATASET and MEASUREMENTS rather than penguins.csv written in, and size nothing by hand."),
]
