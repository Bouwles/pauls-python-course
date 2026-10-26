import numpy as np


def collect(ctx, n, size, seed=4, columns=2):
    m = ctx.module()
    X = np.arange(1, n + 1, dtype=float).reshape(n, 1) * np.ones((1, columns))
    T = X[:, :1] * 10
    got = m.batches(X, T, size, np.random.default_rng(seed))
    try:
        got = [(np.asarray(xb), np.asarray(tb)) for xb, tb in got]
    except (TypeError, ValueError):
        raise CheckFailed("batches should give back an (X, T) pair for each batch.")
    return got, X, T


def matched(ctx):
    got, _, _ = collect(ctx, 8, 3)
    for xb, tb in got:
        if xb.shape[0] != tb.shape[0] or not np.array_equal(xb[:, :1] * 10, tb):
            raise CheckFailed("Each evening's answer should stay with it: here every answer is its evening times ten.",
                              expected=(xb[:, 0] * 10).tolist(), actual=tb.ravel().tolist())


def every_row(ctx):
    got, X, _ = collect(ctx, 8, 3)
    seen = sorted(row for xb, _ in got for row in xb[:, 0].tolist())
    if seen != X[:, 0].tolist():
        raise CheckFailed("One epoch should give every evening exactly once.", expected=X[:, 0].tolist(), actual=seen)


def short_last(ctx):
    got, _, _ = collect(ctx, 10, 4)
    sizes = [len(xb) for xb, _ in got]
    if sizes != [4, 4, 2]:
        raise CheckFailed("Ten evenings in batches of 4: two full batches and a short one.", expected=[4, 4, 2], actual=sizes)


def exact_fit(ctx):
    got, _, _ = collect(ctx, 9, 3)
    sizes = [len(xb) for xb, _ in got]
    if sizes != [3, 3, 3]:
        raise CheckFailed("Nine evenings in batches of 3: three batches.", expected=[3, 3, 3], actual=sizes)


def big_batch(ctx):
    got, _, _ = collect(ctx, 5, 8)
    sizes = [len(xb) for xb, _ in got]
    if sizes != [5]:
        raise CheckFailed("Five evenings in batches of 8: one batch of all five.", expected=[5], actual=sizes)


def left_alone(ctx):
    m = ctx.module()
    X = np.arange(1, 7, dtype=float).reshape(6, 1)
    T = X * 10
    for _ in m.batches(X, T, 4, np.random.default_rng(1)):
        pass
    if not np.array_equal(X.ravel(), np.arange(1, 7)) or not np.array_equal(T.ravel(), np.arange(10, 70, 10)):
        raise CheckFailed("The log you hand to batches should be exactly as it was afterwards.",
                          expected=list(range(1, 7)), actual=X.ravel().tolist())


def shuffled(ctx):
    got, X, _ = collect(ctx, 20, 20, seed=7)
    if not got:
        raise CheckFailed("Twenty evenings in batches of 20 should give one batch. None came out.")
    order = got[0][0][:, 0].tolist()
    if order == X[:, 0].tolist():
        raise CheckFailed("The evenings should come out shuffled, not in the order of the log.", actual=order)
    again, _, _ = collect(ctx, 20, 20, seed=7)
    if again[0][0][:, 0].tolist() != order:
        raise CheckFailed("With the same rng seed, the same shuffle. Use the rng that batches is given.")


TESTS = [
    custom("Each evening keeps its own answer", matched, visible=True),
    custom("Every evening, once an epoch", every_row, visible=True),
    custom("A short last batch", short_last,
           hint="range stops before its end. To start a batch at every multiple of size below len(X), the end is len(X)."),
    custom("Batches that fit exactly", exact_fit),
    custom("A batch bigger than the log", big_batch),
    custom("The log is left as it was", left_alone,
           hint="rng.shuffle shuffles the array you give it, in place. rng.permutation gives a shuffled list of row numbers and leaves the array alone."),
    custom("Shuffled, the same way for the same seed", shuffled),
]
