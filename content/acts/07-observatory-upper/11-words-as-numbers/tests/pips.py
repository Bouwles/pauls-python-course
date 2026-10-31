import numpy as np


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


COUNTS = np.array([[0.0, 3.0, 1.0], [2.0, 0.0, 0.0], [5.0, 4.0, 1.0]])


def load(ctx):
    m = ctx.module()
    if not callable(getattr(m, "probabilities", None)):
        raise CheckFailed("There is no function called probabilities.")
    return m


def rows_add_up(ctx):
    m = load(ctx)
    probs = np.asarray(m.probabilities(COUNTS.copy()), dtype=float)
    sums = probs.sum(axis=1)
    if not np.allclose(sums, 1):
        raise CheckFailed("Each row is the chances of what comes next, so each row adds up to 1.", expected=[1.0, 1.0, 1.0], actual=shown(sums))


def nothing_impossible(ctx):
    m = load(ctx)
    probs = np.asarray(m.probabilities(COUNTS.copy()), dtype=float)
    want = (COUNTS + 0.1) / (COUNTS + 0.1).sum(axis=1, keepdims=True)
    if not np.allclose(probs, want):
        raise CheckFailed("With smoothing 0.1, every pair it never saw still gets a small chance.", expected=shown(want), actual=shown(probs))


def other_smoothing(ctx):
    m = load(ctx)
    probs = np.asarray(m.probabilities(COUNTS.copy(), smoothing=1.0), dtype=float)
    want = (COUNTS + 1.0) / (COUNTS + 1.0).sum(axis=1, keepdims=True)
    if not np.allclose(probs, want):
        raise CheckFailed("probabilities(counts, smoothing=1.0) adds 1 to every count.", expected=shown(want), actual=shown(probs))


def held_back(ctx):
    m = load(ctx)
    with open("forecasts.txt") as f:
        text = f.read()
    with open("held_back.txt") as f:
        held = f.read()
    vocab = m.build_vocab(text)
    probs = m.probabilities(m.count_pairs(m.encode(text, vocab), len(vocab)))
    got = m.perplexity(probs, m.encode(held, vocab))
    if not np.isfinite(got) or abs(got - 7.050) > 0.01:
        raise CheckFailed("Perplexity on the held-back forecasts.", expected=7.05, actual=shown(got))


TESTS = [
    custom("Each row adds up to 1", rows_add_up, visible=True,
           hint="counts.sum(axis=0) adds up each column. Each row needs dividing by its own total: axis=1, keepdims=True."),
    custom("A pair never seen still has a chance", nothing_impossible, visible=True,
           hint="Add smoothing to every count before dividing. The log of 0 is minus infinity, and one unseen pair makes the whole perplexity infinite."),
    custom("Smoothing can be changed", other_smoothing),
    custom("Perplexity on forecasts it never saw", held_back),
]
