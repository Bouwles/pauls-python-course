"""Pip's forecast babbler. Count the pairs, divide, done."""

import numpy as np


def build_vocab(text):
    return sorted(set(text))


def encode(text, vocab):
    index = {char: i for i, char in enumerate(vocab)}
    return [index[char] for char in text]


def decode(ids, vocab):
    return "".join(vocab[i] for i in ids)


def count_pairs(ids, size):
    counts = np.zeros((size, size))
    for a, b in zip(ids, ids[1:]):
        counts[a, b] += 1
    return counts


def probabilities(counts, smoothing=0.1):
    """Add smoothing to every count, then make each row add up to 1."""
    return counts / counts.sum(axis=0)


def perplexity(probs, ids):
    chances = [probs[a, b] for a, b in zip(ids, ids[1:])]
    return float(np.exp(-np.mean(np.log(chances))))


def sample(probs, start, length, rng):
    ids, current = [], start
    for _ in range(length):
        current = int(rng.choice(len(probs), p=probs[current]))
        ids.append(current)
    return ids


if __name__ == "__main__":
    with open("forecasts.txt") as forecasts_file:
        text = forecasts_file.read()
    with open("held_back.txt") as held_file:
        held_back = held_file.read()

    vocab = build_vocab(text)
    probs = probabilities(count_pairs(encode(text, vocab), len(vocab)))
    rng = np.random.default_rng(1979)
    print(decode(sample(probs, vocab.index("\n"), 80, rng), vocab).split("\n")[0])
    print(f"Perplexity on forecasts it never saw: {perplexity(probs, encode(held_back, vocab)):.2f}")
