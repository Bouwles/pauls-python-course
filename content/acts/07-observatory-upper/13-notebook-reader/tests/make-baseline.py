import numpy as np


def load(ctx):
    m = ctx.module()
    for name in ("perplexity", "bigram_probs", "bigram_chances"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def by_hand(ctx):
    m = load(ctx)
    for chances, want in (([0.25, 0.25], 4.0), ([0.5, 0.125], 4.0), ([1.0, 1.0, 1.0], 1.0)):
        got = m.perplexity(np.array(chances))
        if got is None or abs(float(got) - want) > 1e-9:
            raise CheckFailed(f"perplexity of {chances}.", expected=want, actual=None if got is None else shown(got))


def counted(ctx):
    m = load(ctx)
    X = np.array([[0, 1], [2, 1], [1, 2], [0, 0]])
    y = np.array([2, 2, 0, 1])
    counts = np.array([[0.0, 1.0, 0.0], [0.0, 0.0, 2.0], [1.0, 0.0, 0.0]])
    want = (counts + 0.1) / (counts + 0.1).sum(axis=1, keepdims=True)
    got = m.bigram_probs(X, y, 3)
    if got is None or np.shape(got) != (3, 3) or not np.allclose(got, want):
        raise CheckFailed("Four windows: count each window's last character followed by its target, add 0.1, divide each row.",
                          expected=shown(want), actual=None if got is None else shown(got))


def chances(ctx):
    m = load(ctx)
    probs = np.array([[0.1, 0.9], [0.6, 0.4]])
    got = m.bigram_chances(probs, np.array([[1, 0], [0, 1], [1, 1]]), np.array([1, 0, 0]))
    if got is None or not np.allclose(got, [0.9, 0.6, 0.6]):
        raise CheckFailed("The chance of each real next character, given each window's last character.", expected=[0.9, 0.6, 0.6], actual=None if got is None else shown(got))


def smoothing(ctx):
    m = load(ctx)
    X, y = np.array([[0], [0], [1]]), np.array([0, 0, 1])
    got = m.bigram_probs(X, y, 2, smoothing=1.0)
    want = np.array([[3 / 4, 1 / 4], [1 / 3, 2 / 3]])
    if got is None or not np.allclose(got, want):
        raise CheckFailed("bigram_probs with smoothing=1.0.", expected=shown(want), actual=None if got is None else shown(got))


def held_back(ctx):
    m = load(ctx)
    notes = m.load_notes()
    learn, held = m.split_notes(notes)
    vocab = m.build_vocab(notes)
    X, y = m.windows(learn, vocab, 4)
    Xh, yh = m.windows(held, vocab, 4)
    got = m.perplexity(m.bigram_chances(m.bigram_probs(X, y, len(vocab)), Xh, yh))
    if got is None or abs(float(got) - 10.711) > 0.01:
        raise CheckFailed("The bigram's perplexity on the held-back notes.", expected=10.71, actual=None if got is None else shown(got))


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    for want in ("55", "10.71"):
        if want not in r.output:
            raise CheckFailed(f"The program should report {want}.", expected=want, actual=r.output)


TESTS = [
    custom("Perplexity by hand", by_hand, visible=True),
    custom("Bigram chances from four windows", counted, visible=True,
           hint="Only the last character of each window counts: X[:, -1]."),
    custom("The chance of each real next character", chances),
    custom("Smoothing can be changed", smoothing),
    custom("The bigram on the held-back notes", held_back),
    custom("The program", program),
]
