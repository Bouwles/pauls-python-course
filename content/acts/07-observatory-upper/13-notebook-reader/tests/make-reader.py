import json

import numpy as np


def ref_forward(X, p):
    flat = p["E"][X].reshape(len(X), -1)
    H = np.tanh(flat @ p["W1"] + p["b1"])
    S = H @ p["W2"] + p["b2"]
    e = np.exp(S - S.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


def ref_complete(start, p, vocab, rng, temperature=1.0, limit=200, context=4):
    index = {c: i for i, c in enumerate(vocab)}
    ids = [index["\n"]] * context + [index[c] for c in start]
    text = start
    for _ in range(limit):
        chances = ref_forward(np.array([ids[-context:]]), p)[0]
        if temperature == 0:
            choice = int(np.argmax(chances))
        else:
            weighted = chances ** (1 / temperature)
            choice = int(rng.choice(len(chances), p=weighted / weighted.sum()))
        if vocab[choice] == "\n":
            break
        ids.append(choice)
        text += vocab[choice]
    return text


def setting(ctx):
    m = ctx.module()
    if not callable(getattr(m, "complete", None)):
        raise CheckFailed("There is no function called complete.")
    with open("trained.json") as f:
        p = {name: np.array(value) for name, value in json.load(f).items()}
    with open("notes.txt") as f:
        vocab = sorted(set(f.read()) | {"\n"})
    return m, p, vocab


def text_of(got):
    if not isinstance(got, str):
        raise CheckFailed("complete should return the note as a string.", actual=repr(got)[:120])
    return got


def greedy(ctx):
    m, p, vocab = setting(ctx)
    got = text_of(m.complete("The clock", p, vocab, np.random.default_rng(0), temperature=0, limit=60))
    want = ref_complete("The clock", p, vocab, None, temperature=0, limit=60)
    if got != want:
        raise CheckFailed("Temperature 0 takes the likeliest character every time.", expected=want, actual=got)


def seeded(ctx):
    m, p, vocab = setting(ctx)
    first = text_of(m.complete("Neil says", p, vocab, np.random.default_rng(11), temperature=1.0))
    again = text_of(m.complete("Neil says", p, vocab, np.random.default_rng(11), temperature=1.0))
    if first != again:
        raise CheckFailed("The same seed should finish the note the same way.", expected=first, actual=again)
    if not first.startswith("Neil says"):
        raise CheckFailed("The finished note should begin with the start it was given.", actual=first)


def sampled(ctx):
    m, p, vocab = setting(ctx)
    got = text_of(m.complete("Good names", p, vocab, np.random.default_rng(5), temperature=1.0))
    want = ref_complete("Good names", p, vocab, np.random.default_rng(5), temperature=1.0)
    if got != want:
        raise CheckFailed("Seed 5, temperature 1.", expected=want, actual=got)


def warmer_cooler(ctx):
    m, p, vocab = setting(ctx)
    for temperature in (0.5, 2.0):
        got = text_of(m.complete("Caitlin", p, vocab, np.random.default_rng(8), temperature=temperature))
        want = ref_complete("Caitlin", p, vocab, np.random.default_rng(8), temperature=temperature)
        if got != want:
            raise CheckFailed(f"Seed 8, temperature {temperature}: raise the chances to the power 1 / temperature, then divide by their total.", expected=want, actual=got)


def stops(ctx):
    m, p, vocab = setting(ctx)
    short = text_of(m.complete("Whoever", p, vocab, np.random.default_rng(1), temperature=1.0, limit=5))
    if len(short) > len("Whoever") + 5:
        raise CheckFailed("With limit 5, at most five characters are added.", actual=short)
    for seed in range(4):
        note = text_of(m.complete("I", p, vocab, np.random.default_rng(seed), temperature=1.0))
        if "\n" in note or any(char not in vocab for char in note):
            raise CheckFailed("A finished note has no newline in it, and only characters from the vocabulary.", actual=repr(note))


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    for want in ("Reading with Aaesha's weights.", "The duck. P.", "Always the likeliest: The clock and the code it has"):
        if want not in r.output:
            raise CheckFailed(f"The output should include {want!r}.", expected=want, actual=r.output)


TESTS = [
    custom("Always the likeliest, at temperature 0", greedy, visible=True),
    custom("The same seed, the same note", seeded, visible=True),
    custom("Sampling with a seed", sampled,
           hint="Draw each character with rng.choice(len(chances), p=...), once per character, from the rng you were given."),
    custom("Warmer and cooler", warmer_cooler),
    custom("A limit, and no newline", stops,
           hint="Stop as soon as the model chooses a newline, and don't add the newline to the note."),
    custom("The program", program),
]
