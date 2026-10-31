"""The notebook reader: give it the start of a note, and it finishes it."""

import os

import numpy as np

from model import CONTEXT, forward, load_params
from notes import NEWLINE, build_vocab, load_notes


def complete(start, params, vocab, rng, temperature=1.0, limit=200):
    """The note that begins with start, carried on a character at a time until the model
    chooses a newline or has added limit characters. temperature 0 always takes the likeliest."""
    index = {char: i for i, char in enumerate(vocab)}
    # The window starts as newlines, then the start of the note
    ids = [index[NEWLINE]] * CONTEXT + [index[char] for char in start]
    text = start
    for _ in range(limit):
        # The chances of every next character, from the last CONTEXT characters
        P, _ = forward(np.array([ids[-CONTEXT:]]), params)
        chances = P[0]
        # Choose one: the likeliest, or a draw from the chances sharpened or flattened by temperature
        if temperature == 0:
            choice = int(np.argmax(chances))
        else:
            weighted = chances ** (1 / temperature)
            choice = int(rng.choice(len(chances), p=weighted / weighted.sum()))
        # A newline ends the note
        if vocab[choice] == NEWLINE:
            break
        ids.append(choice)
        text += vocab[choice]
    return text


if __name__ == "__main__":
    vocab = build_vocab(load_notes())
    if os.path.exists("my_weights.json"):
        params, whose = load_params("my_weights.json"), "yours"
    else:
        params, whose = load_params("trained.json"), "Aaesha's"
    print(f"Reading with {whose} weights.")

    rng = np.random.default_rng(20)
    for start in ["Good names", "The duck", "Whoever reads this"]:
        print(complete(start, params, vocab, rng, temperature=0.7))
    print("Always the likeliest:", complete("The clock", params, vocab, rng, temperature=0, limit=60))
