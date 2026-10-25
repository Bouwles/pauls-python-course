import re as _re

import numpy as _np

NEEDED = ("distances", "nearest", "vote", "predict", "accuracy", "choose_k")
TABLE = [(1, 1.000, 0.792), (3, 0.889, 0.771), (5, 0.868, 0.854), (7, 0.847, 0.875),
         (9, 0.847, 0.896), (11, 0.847, 0.833), (15, 0.854, 0.875), (21, 0.833, 0.833)]


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"nights.py needs a function called {name}. The list is at the top of the file.")
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


def _skies(seed, n):
    rng = _np.random.default_rng(seed)
    X = rng.normal(size=(n, 3))
    labels = _np.where(X[:, 0] + rng.normal(0, 0.6, n) > 0.4, "fog", _np.where(X[:, 1] > 0, "cloud", "clear"))
    return X, labels


def euclidean(ctx):
    mod = _module(ctx, "distances")
    got = _array(mod.distances(_np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 1.0]]), _np.array([0.0, 0.0])), "distances").astype(float)
    if got.shape != (3,) or not _np.allclose(got, [0.0, 5.0, 2 ** 0.5]):
        raise CheckFailed("One straight-line distance per row.", expected=[0.0, 5.0, 1.414], actual=_np.round(got, 3).tolist())


def vote_simple(ctx):
    mod = _module(ctx, "vote")
    got = mod.vote(_np.array(["fog", "cloud", "fog"]))
    if got != "fog":
        raise CheckFailed("Two fogs beat one cloud.", expected="fog", actual=repr(got))


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
    got = mod.vote(_np.array(["cloud", "fog", "fog", "cloud", "clear"]))
    if got != "cloud":
        raise CheckFailed("Two clouds and two fogs: the tie goes to the label of the nearest night, which comes first.",
                          expected="cloud", actual=repr(got))


def predict_small(ctx):
    mod = _module(ctx, "distances", "nearest", "vote", "predict")
    X_train = _np.array([[0.0, 0.0], [0.2, 0.1], [5.0, 5.0], [5.1, 4.9], [4.8, 5.2]])
    labels = _np.array(["clear", "clear", "fog", "fog", "cloud"])
    got = _array(mod.predict(X_train, labels, _np.array([[0.1, 0.0], [5.0, 5.1], [4.9, 5.1]]), 3), "predict")
    if got.shape != (3,) or got.tolist() != ["clear", "fog", "fog"]:
        raise CheckFailed("One forecast per new evening, each the vote of its three nearest.",
                          expected=["clear", "fog", "fog"], actual=got.tolist())


def predict_matches(ctx):
    mod = _module(ctx, "distances", "nearest", "vote", "predict")
    X_train, labels = _skies(4, 60)
    X_new, _ = _skies(5, 25)
    for k in [1, 4, 7]:
        want = _reference(X_train, labels, X_new, k)
        got = _array(mod.predict(X_train, labels, X_new, k), "predict")
        if got.shape != want.shape or not _np.array_equal(got, want):
            raise CheckFailed(f"On readings of the checks' own, k = {k}, some forecasts differ.",
                              expected=want.tolist(), actual=got.tolist())


def remembers_itself(ctx):
    mod = _module(ctx, "distances", "nearest", "vote", "predict")
    X_train, labels = _skies(6, 30)
    got = _array(mod.predict(X_train, labels, X_train, 1), "predict")
    if not _np.array_equal(got, labels):
        raise CheckFailed("With k = 1, every training night's nearest night is itself.", expected=labels.tolist(), actual=got.tolist())


def accuracy_share(ctx):
    mod = _module(ctx, "accuracy")
    got = float(mod.accuracy(_np.array(["fog", "clear", "cloud", "fog"]), _np.array(["fog", "cloud", "cloud", "clear"])))
    if abs(got - 0.5) > 1e-9:
        raise CheckFailed("Two of four match.", expected=0.5, actual=got)


def choose_small(ctx):
    mod = _module(ctx)
    X_train, labels = _skies(7, 50)
    X_val, val_labels = _skies(8, 30)
    ks = [1, 3, 5, 7, 9, 13]
    scores = [_np.mean(_reference(X_train, labels, X_val, k) == val_labels) for k in ks]
    want = ks[int(_np.argmax(scores))]
    got = mod.choose_k(X_train, labels, X_val, val_labels, ks)
    if got != want:
        raise CheckFailed(f"Validation accuracies {_np.round(scores, 3).tolist()} for k in {ks}: the first best is k = {want}.",
                          expected=want, actual=got)


def no_library(ctx):
    if _re.search(r"^\s*(from|import)\s+sklearn", ctx.source, _re.M):
        raise CheckFailed("Build it from scratch with NumPy. scikit-learn comes later in the Act.")


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
            raise CheckFailed(f"The accuracies for k = {k} are off. Is the split exactly as the requirements say, and everything scaled with the training ruler?",
                              expected=f"{k:2}  {training:8.3f}  {validation:10.3f}",
                              actual=f"{k:2}  {got_training:8.3f}  {got_validation:10.3f}")


TESTS = [
    custom("distances from (0, 0)", euclidean, visible=True),
    custom("vote of fog, cloud, fog", vote_simple, visible=True),
    custom("Manhattan distance", manhattan),
    custom("nearest gives positions, nearest first", nearest_order,
           hint="If only this fails, return positions with np.argsort(..., kind=\"stable\"), not the distances themselves."),
    custom("A tied vote goes to the nearest", vote_tie,
           hint="If only this fails, on a tie pick the tied label that appears first: Counter's most_common keeps first-seen order."),
    custom("predict gives one forecast per evening", predict_small),
    custom("predict matches nearest neighbours on other readings", predict_matches),
    custom("With k = 1 it remembers every training night", remembers_itself),
    custom("accuracy is the share that match", accuracy_share),
    custom("choose_k picks by validation", choose_small,
           hint="If only this fails, score each k on the validation evenings and give back the k, not its position."),
    custom("Built from scratch", no_library),
    custom("Prints the table for every k", table),
    output("Chooses k", expect="Chosen k: 9", match="contains"),
    output("Opens the test evenings once", expect="Test accuracy: 0.77", match="contains"),
    output("Tonight", expect="Tonight: fog, like 6 of the 9 nearest nights", match="contains",
           hint="Scale TONIGHT with the training evenings' means and spreads, and let the chosen k nights vote."),
    output("Only three ks to choose from", set_vars={"KS": [1, 3, 5]}, expect="Chosen k: 5", match="contains",
           hint="If only this fails, choose from KS, not from a list written in again."),
    output("A wet, windy evening", set_vars={"TONIGHT": [93.0, 2.5, 12.0, 1004.0]},
           expect="Tonight: cloud, like 6 of the 9 nearest nights", match="contains"),
    output("A dry, settled evening", set_vars={"TONIGHT": [72.0, 3.1, 6.0, 1025.0]},
           expect="Tonight: clear, like 9 of the 9 nearest nights", match="contains"),
]
