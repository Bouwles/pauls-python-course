import re as _re

import numpy as _np

NEEDED = ("prepare", "initial_centres", "assign", "update", "inertia", "k_means", "best_of", "choose_k")
TABLE = {1: 2640.0, 2: 1848.0, 3: 1558.0, 4: 1391.9, 5: 1272.8, 6: 1182.7, 7: 1102.7, 8: 1032.1}
_RUN = {}


def _module(ctx, *names):
    mod = ctx.module()
    for name in names or NEEDED:
        if not callable(getattr(mod, name, None)):
            raise CheckFailed(f"segments.py needs a function called {name}. The list is at the top of the file.")
    return mod


def _array(value, what):
    if value is None:
        raise CheckFailed(f"{what} gave back None. Did it change something in place instead of returning it?")
    return _np.asarray(value)


def _blobs(seed=3):
    rng = _np.random.default_rng(seed)
    middles = _np.array([[10.0, 10.0], [60.0, 15.0], [35.0, 70.0]])
    points = _np.vstack([m + rng.normal(0, 3, size=(25, 2)) for m in middles])
    return points[rng.permutation(len(points))], middles


def _run_k_means(mod, points, k, rng, **kw):
    result = mod.k_means(points, k, rng, **kw)
    if result is None:
        raise CheckFailed("k_means gave back None. It should return centres, labels and history.")
    try:
        centres, labels, history = result
    except (TypeError, ValueError):
        raise CheckFailed("k_means should return three things: centres, labels, history.", actual=repr(result)[:200])
    return _np.asarray(centres, dtype=float), _np.asarray(labels), _np.asarray(history, dtype=float)


def assign_small(ctx):
    mod = _module(ctx, "assign")
    points = _np.array([[0.0, 0.0], [1.0, 0.0], [9.0, 9.0], [5.0, 4.0]])
    centres = _np.array([[0.0, 1.0], [10.0, 10.0]])
    got = _array(mod.assign(points, centres), "assign")
    if got.shape != (4,) or not _np.array_equal(got, [0, 0, 1, 0]):
        raise CheckFailed("Each customer gets the position of its nearest centre. (5, 4) is nearer (0, 1) than (10, 10).",
                          expected=[0, 0, 1, 0], actual=got.tolist())


def update_small(ctx):
    mod = _module(ctx, "update")
    points = _np.array([[0.0, 0.0], [2.0, 0.0], [10.0, 10.0], [12.0, 14.0]])
    centres = _np.array([[1.0, 1.0], [9.0, 9.0]])
    got = _array(mod.update(points, _np.array([0, 0, 1, 1]), centres), "update").astype(float)
    want = [[1.0, 0.0], [11.0, 12.0]]
    if got.shape != (2, 2) or not _np.allclose(got, want):
        raise CheckFailed("Each centre moves to the mean of its customers.", expected=want, actual=_np.round(got, 3).tolist())


def update_empty(ctx):
    mod = _module(ctx, "update")
    points = _np.array([[0.0, 0.0], [2.0, 0.0], [10.0, 10.0], [12.0, 14.0]])
    centres = _np.array([[1.0, 1.0], [9.0, 9.0], [50.0, 50.0]])
    before = centres.copy()
    got = _array(mod.update(points, _np.array([0, 0, 1, 1]), centres), "update").astype(float)
    want = [[1.0, 0.0], [11.0, 12.0], [50.0, 50.0]]
    if got.shape != (3, 2) or not _np.allclose(got, want):
        raise CheckFailed("The third centre has no customers, so it stays at (50, 50). The mean of nobody is nan.",
                          expected=want, actual=_np.round(got, 3).tolist())
    if not _np.array_equal(centres, before):
        raise CheckFailed("update changed the centres it was given. Work on a copy and return that.")


def inertia_small(ctx):
    mod = _module(ctx, "inertia")
    points = _np.array([[0.0, 0.0], [2.0, 0.0], [10.0, 10.0]])
    got = mod.inertia(points, _np.array([0, 0, 1]), _np.array([[1.0, 0.0], [10.0, 13.0]]))
    if got is None or _np.ndim(got) != 0 or abs(float(got) - 11.0) > 1e-9:
        raise CheckFailed("Squared distances 1, 1 and 9 add up to 11: one number for every customer together.", expected=11.0, actual=got)


def starts(ctx):
    mod = _module(ctx, "initial_centres")
    points, _ = _blobs()
    got = _array(mod.initial_centres(points, 4, _np.random.default_rng(7)), "initial_centres").astype(float)
    want = points[_np.random.default_rng(7).choice(len(points), size=4, replace=False)]
    if got.shape != (4, 2) or not _np.allclose(got, want):
        raise CheckFailed("Pick the starting customers with rng.choice(len(points), size=k, replace=False).",
                          expected=_np.round(want, 2).tolist(), actual=_np.round(got, 2).tolist())
    few = _np.array([[float(i), 0.0] for i in range(5)])
    for seed in range(40):
        chosen = _np.asarray(mod.initial_centres(few, 5, _np.random.default_rng(seed)))
        if len({tuple(row) for row in chosen.tolist()}) != 5:
            raise CheckFailed("The starting centres must be k different customers.", actual=chosen.tolist())


def finds_blobs(ctx):
    mod = _module(ctx, "initial_centres", "assign", "update", "inertia", "k_means")
    points, middles = _blobs()
    centres, labels, history = _run_k_means(mod, points, 3, _np.random.default_rng(2))
    if centres.shape != (3, 2) or labels.shape != (75,):
        raise CheckFailed("Three clumps of 25: centres is (3, 2) and labels has one group per point.",
                          expected="(3, 2) and (75,)", actual=f"{centres.shape} and {labels.shape}")
    for m in middles:
        if _np.min(_np.linalg.norm(centres - m, axis=1)) > 1.5:
            raise CheckFailed("Three clear clumps, so each should end with a centre near its middle.",
                              expected=middles.tolist(), actual=_np.round(centres, 1).tolist())
    if not _np.array_equal(labels, _np.linalg.norm(points[:, None] - centres[None], axis=2).argmin(axis=1)):
        raise CheckFailed("The labels k_means returns should match the centres it returns: every point with its nearest.")


def never_rises(ctx):
    mod = _module(ctx, "initial_centres", "assign", "update", "inertia", "k_means")
    rng = _np.random.default_rng(12)
    points = rng.uniform(0, 100, size=(120, 2))
    centres, labels, history = _run_k_means(mod, points, 6, _np.random.default_rng(4))
    if len(history) < 2:
        raise CheckFailed("history should hold the inertia after every assignment, and there's always more than one.", actual=history.tolist())
    rises = [i for i in range(1, len(history)) if history[i] > history[i - 1] + 1e-9]
    if rises:
        i = rises[0]
        raise CheckFailed(f"The inertia rose at assignment {i}. Assigning and updating should only ever lower it.",
                          expected=f"at most {history[i - 1]:.2f}", actual=f"{history[i]:.2f}")
    want = _np.sum((points - centres[labels]) ** 2)
    if abs(history[-1] - want) > 1e-6:
        raise CheckFailed("The last entry in history should be the inertia of the centres and labels returned.",
                          expected=round(float(want), 2), actual=round(float(history[-1]), 2))


def one_group(ctx):
    mod = _module(ctx, "initial_centres", "assign", "update", "inertia", "k_means")
    points = _np.array([[0.0, 0.0], [4.0, 0.0], [2.0, 6.0]])
    centres, labels, history = _run_k_means(mod, points, 1, _np.random.default_rng(0))
    if not _np.allclose(centres, [[2.0, 2.0]]) or len(history) != 2:
        raise CheckFailed("With one group: assign, move to the mean, assign again, see nothing change, stop. Two assignments.",
                          expected="centre (2, 2), 2 entries in history", actual=f"centre {centres.tolist()}, {len(history)} entries")


def best_of_tries(ctx):
    mod = _module(ctx, "initial_centres", "assign", "update", "inertia", "k_means", "best_of")
    rng = _np.random.default_rng(21)
    points = rng.uniform(0, 50, size=(60, 2))
    finals = []
    replay = _np.random.default_rng(9)
    for attempt in range(6):
        _, _, history = _run_k_means(mod, points, 5, replay)
        finals.append(history[-1])
    result = mod.best_of(points, 5, 6, _np.random.default_rng(9))
    try:
        centres, labels, spread = result
    except (TypeError, ValueError):
        raise CheckFailed("best_of should return three things: centres, labels and the inertia.", actual=repr(result)[:200])
    if abs(float(spread) - min(finals)) > 1e-6:
        raise CheckFailed("Six tries from the same rng: keep the one with the lowest final inertia.",
                          expected=round(min(finals), 2), actual=round(float(spread), 2))


def elbow(ctx):
    mod = _module(ctx, "choose_k")
    cases = [
        ({1: 1000.0, 2: 400.0, 3: 100.0, 4: 90.0, 5: 85.0}, 3),
        ({1: 500.0, 2: 450.0, 3: 400.0}, 1),
        ({1: 900.0, 2: 300.0, 3: 200.0, 4: 160.0, 5: 150.0, 6: 140.0}, 3),
        ({1: 100.0, 2: 50.0, 3: 25.0}, 3),
    ]
    for inertias, want in cases:
        got = mod.choose_k(dict(inertias))
        if got != want:
            raise CheckFailed("Choose the smallest k for which one more group cuts the inertia by less than a quarter, or the largest k if every extra group pays.",
                              expected=want, actual=got, extra={"inertias": repr(inertias)})


def _output(ctx):
    if "result" not in _RUN:
        _RUN["result"] = ctx.run_program()
    result = _RUN["result"]
    if result.error is not None:
        raise CheckFailed(f"The program crashed: {type(result.error).__name__}: {result.error}")
    return result.output


def table(ctx):
    output = _output(ctx)
    rows = {int(m.group(1)): float(m.group(2)) for m in _re.finditer(r"^\s*(\d)\s+(\d+(?:\.\d+)?)\s*$", output, _re.M)}
    for k, want in TABLE.items():
        if k not in rows:
            raise CheckFailed(f"There's no row for k = {k}: k, then the best inertia.", expected=f"{k}  {want:8.1f}", actual=output)
        if abs(rows[k] - want) > 0.15:
            raise CheckFailed(f"The best inertia for k = {k} is off. Is it the best of 10 tries, with rng = np.random.default_rng(10), on the prepared spending?",
                              expected=f"{k}  {want:8.1f}", actual=f"{k}  {rows[k]:8.1f}")


def prepared(ctx):
    mod = _module(ctx, "prepare")
    spending = _np.array([[1.0, 100.0], [_np.e, 10.0], [_np.e ** 2, 1000.0]])
    got = mod.prepare(spending)
    if got is None:
        raise CheckFailed("prepare gave back None. Did it return the prepared array?")
    got = _np.asarray(got, dtype=float)
    logged = _np.log(spending)
    want = (logged - logged.mean(axis=0)) / logged.std(axis=0)
    if got.shape != (3, 2) or not _np.allclose(got, want):
        raise CheckFailed("Take the log of the spending first, then standardise each column.", expected=_np.round(want, 3).tolist(), actual=_np.round(got, 3).tolist())


def _line(ctx, start, want, why):
    output = _output(ctx)
    lines = [line.strip() for line in output.splitlines() if line.strip().startswith(start)]
    if not lines:
        raise CheckFailed(f"There's no line starting {start!r}.", expected=want, actual=output)
    if lines[-1] != want:
        raise CheckFailed(why, expected=want, actual=lines[-1])


def chosen(ctx):
    _line(ctx, "Chosen k:", "Chosen k: 2", "At the elbow: the last k before one more group stops paying for itself.")


def segment_one(ctx):
    _line(ctx, "Segment 1:", "Segment 1: 251 customers, 3% retail, above average on fresh, frozen",
          "Describe the biggest segment first: its size, its share of retail customers, and the goods where its centre is above 0.")


def segment_two(ctx):
    _line(ctx, "Segment 2:", "Segment 2: 189 customers, 71% retail, above average on milk, grocery, detergents_paper, delicatessen",
          "Then the next biggest.")


def agrees(ctx):
    _line(ctx, "scikit-learn agrees:", "scikit-learn agrees: True",
          "Your best inertia for the chosen k should be within a thousandth of KMeans's.")


TESTS = [
    custom("assign gives each customer its nearest centre", assign_small, visible=True),
    custom("update moves each centre to the mean of its customers", update_small, visible=True),
    custom("prepare takes the log, then standardises", prepared,
           hint="If only this fails, np.log the spending before working out the means and spreads."),
    custom("inertia adds up the squared distances", inertia_small),
    custom("initial_centres picks k different customers", starts,
           hint="If only this fails, use rng.choice(len(points), size=k, replace=False): without replace=False, a customer can be picked twice."),
    custom("update leaves a centre with no customers where it was", update_empty,
           hint="If only this fails, only move a centre that has at least one customer, and copy the centres before changing any."),
    custom("k_means finds three clear clumps", finds_blobs),
    custom("The inertia never rises", never_rises,
           hint="If only this fails, record the inertia right after each assignment, using the centres the points were assigned to."),
    custom("One group stops after two assignments, at the mean", one_group,
           hint="If only this fails, stop as soon as an assignment gives exactly the same labels as the one before."),
    custom("best_of keeps the lowest inertia", best_of_tries,
           hint="If only this fails, pass the same rng to every try, so each one starts somewhere new."),
    custom("choose_k finds the elbow", elbow),
    custom("Prints the best inertia for every k", table),
    custom("Chooses k = 2", chosen),
    custom("Describes the biggest segment", segment_one),
    custom("Describes the other", segment_two),
    custom("Agrees with scikit-learn's KMeans", agrees),
]
