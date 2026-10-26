import re

import numpy as np


def shown(value):
    array = np.round(np.asarray(value, dtype=float), 4)
    return array.tolist() if np.all(np.isfinite(array)) else str(array.tolist())


def load(ctx):
    m = ctx.module()
    for name in ("build_vocab", "encode", "decode", "count_pairs", "probabilities", "average_nll", "perplexity", "sample"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def read(name):
    with open(name) as f:
        return f.read()


def ref_model(text, smoothing=0.1):
    vocab = sorted(set(text))
    index = {c: i for i, c in enumerate(vocab)}
    ids = [index[c] for c in text]
    counts = np.zeros((len(vocab), len(vocab)))
    for a, b in zip(ids, ids[1:]):
        counts[a, b] += 1
    return vocab, ids, counts, (counts + smoothing) / (counts + smoothing).sum(axis=1, keepdims=True)


def vocab_and_ids(ctx):
    m = load(ctx)
    vocab = m.build_vocab("sea state")
    if list(vocab) != [" ", "a", "e", "s", "t"]:
        raise CheckFailed("The vocabulary of \"sea state\": every character once, sorted, the space included.",
                          expected=[" ", "a", "e", "s", "t"], actual=repr(vocab))
    ids = m.encode("sea state", vocab)
    if list(ids) != [3, 2, 1, 0, 3, 4, 1, 4, 2]:
        raise CheckFailed("\"sea state\" as ids.", expected=[3, 2, 1, 0, 3, 4, 1, 4, 2], actual=repr(ids))
    back = m.decode([3, 2, 1, 0, 3, 4, 1, 4, 2], vocab)
    if back != "sea state":
        raise CheckFailed("Decoding the ids should give the text back.", expected="sea state", actual=repr(back))


def counts_and_chances(ctx):
    m = load(ctx)
    counts = np.asarray(m.count_pairs([0, 1, 1, 2, 0, 1], 3), dtype=float)
    want = np.array([[0.0, 2.0, 0.0], [0.0, 1.0, 1.0], [1.0, 0.0, 0.0]])
    if counts.shape != (3, 3) or not np.array_equal(counts, want):
        raise CheckFailed("counts[a, b]: how often b comes straight after a, for ids 0 1 1 2 0 1.", expected=want.tolist(), actual=shown(counts))
    probs = np.asarray(m.probabilities(want.copy()), dtype=float)
    expect = (want + 0.1) / (want + 0.1).sum(axis=1, keepdims=True)
    if not np.allclose(probs, expect):
        raise CheckFailed("Add 0.1 to every count, then divide each row by its total.", expected=shown(expect), actual=shown(probs))


def encode_uses_order(ctx):
    m = load(ctx)
    ids = m.encode("abba", ["b", "a"])
    if list(ids) != [1, 0, 0, 1]:
        raise CheckFailed("An id is the character's place in the vocabulary you're given, whatever order it's in.", expected=[1, 0, 0, 1], actual=repr(ids))


def round_trip(ctx):
    m = load(ctx)
    text = read("forecasts.txt")
    vocab = m.build_vocab(text)
    if len(vocab) != 39 or vocab[0] != "\n":
        raise CheckFailed("The forecasts have 39 different characters, and the newline sorts first.", expected=39, actual=len(vocab))
    if m.decode(m.encode(text, vocab), vocab) != text:
        raise CheckFailed("Every forecast should come back from encode then decode exactly as it was.")


def forecast_counts(ctx):
    m = load(ctx)
    text = read("forecasts.txt")
    vocab, ids, counts, probs = ref_model(text)
    got = np.asarray(m.count_pairs(m.encode(text, vocab), len(vocab)), dtype=float)
    if got.shape != counts.shape or not np.array_equal(got, counts):
        raise CheckFailed("The pair counts for the forecasts.", expected=f"{int(counts.sum())} pairs", actual=f"{int(got.sum())} pairs, shape {got.shape}")


def smoothing_values(ctx):
    m = load(ctx)
    counts = np.array([[0.0, 4.0], [1.0, 1.0]])
    for smoothing in (0.0, 1.0):
        got = np.asarray(m.probabilities(counts.copy(), smoothing), dtype=float)
        want = (counts + smoothing) / (counts + smoothing).sum(axis=1, keepdims=True)
        if not np.allclose(got, want):
            raise CheckFailed(f"probabilities with smoothing {smoothing}.", expected=shown(want), actual=shown(got))


def nll_by_hand(ctx):
    m = load(ctx)
    probs = np.array([[0.5, 0.5], [0.2, 0.8]])
    got = m.average_nll(probs, [0, 1, 1])
    want = -(np.log(0.5) + np.log(0.8)) / 2
    if got is None or abs(float(got) - want) > 1e-9:
        raise CheckFailed("ids 0 1 1: two pairs, chances 0.5 and 0.8.", expected=round(want, 6), actual=None if got is None else shown(got))
    ppl = m.perplexity(probs, [0, 1, 1])
    if ppl is None or abs(float(ppl) - np.exp(want)) > 1e-9:
        raise CheckFailed("Perplexity is e to the average negative log likelihood.", expected=round(float(np.exp(want)), 6), actual=None if ppl is None else shown(ppl))


def held_back_perplexity(ctx):
    m = load(ctx)
    text, held = read("forecasts.txt"), read("held_back.txt")
    vocab = m.build_vocab(text)
    probs = m.probabilities(m.count_pairs(m.encode(text, vocab), len(vocab)))
    got = m.perplexity(probs, m.encode(held, vocab))
    if got is None or not np.isfinite(got) or abs(got - 7.300) > 0.01:
        raise CheckFailed("Perplexity on the held-back forecasts, smoothing 0.1.", expected=7.30, actual=None if got is None else shown(got))


def sample_cycle(ctx):
    m = load(ctx)
    probs = np.array([[0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 0.0]])
    got = m.sample(probs, 0, 6, np.random.default_rng(0))
    if got is None or [int(i) for i in got] != [1, 2, 3, 0, 1, 2]:
        raise CheckFailed("Each character always followed by the next: from 0, six ids.", expected=[1, 2, 3, 0, 1, 2], actual=repr(got))


def sample_seeded(ctx):
    m = load(ctx)
    text = read("forecasts.txt")
    vocab, ids, counts, probs = ref_model(text)
    rng = np.random.default_rng(42)
    want, current = [], 0
    for _ in range(40):
        current = int(rng.choice(len(probs), p=probs[current]))
        want.append(current)
    got = m.sample(probs, 0, 40, np.random.default_rng(42))
    if got is None or [int(i) for i in got] != want:
        raise CheckFailed("Forty characters from seed 42, starting after a newline.", expected="".join(vocab[i] for i in want),
                          actual=None if got is None else repr("".join(vocab[int(i)] for i in got if 0 <= int(i) < len(vocab))))
    again = m.sample(probs, 0, 40, np.random.default_rng(42))
    if [int(i) for i in again] != want:
        raise CheckFailed("The same seed should give the same forty characters.")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    for want in ("Vocabulary: 39 characters", "Perplexity on forecasts it never saw: 7.30"):
        if want not in r.output:
            raise CheckFailed(f"The output should include {want!r}.", expected=want, actual=r.output)


TESTS = [
    custom("Characters to ids and back", vocab_and_ids, visible=True),
    custom("Counting pairs, then chances", counts_and_chances, visible=True,
           hint="counts[a, b] += 1 for each pair; then add smoothing and divide each row by its own total."),
    custom("encode follows the vocabulary it's given", encode_uses_order),
    custom("Every forecast survives encode and decode", round_trip),
    custom("The forecasts' pair counts", forecast_counts),
    custom("Smoothing of 0 and of 1", smoothing_values),
    custom("Negative log likelihood and perplexity by hand", nll_by_hand),
    custom("Perplexity on the held-back forecasts", held_back_perplexity),
    custom("Sampling follows the chances", sample_cycle),
    custom("Sampling with a seed", sample_seeded,
           hint="Draw each id with rng.choice(len(probs), p=probs[current]), once per character, and use the rng you're given."),
    custom("The program", program),
]
