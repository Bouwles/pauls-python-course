"""A small network that reads four characters and guesses the fifth.

init_model(size, context=CONTEXT, dim=DIM, hidden=HIDDEN, seed=0)
                                 E (size, dim), W1 (context * dim, hidden), b1, W2 (hidden, size), b2
forward(X, params)               (P, cache): the chances of every next character, a row per window
loss(P, y)                       the average of minus the log of each real next character's chance
backward(X, y, params, cache)    the gradient for every weight, keyed like params
train(X, y, params, rate, steps, batch=64, seed=0)
                                 mini-batch gradient descent; changes params; returns the losses
model_chances(X, y, params)      the chance the model gives each real next character

Run as a program: train on the notes, compare with the bigram, save my_weights.json.
"""

import json

import numpy as np

from baseline import bigram_chances, bigram_probs, perplexity
from notes import build_vocab, load_notes, split_notes, windows

CONTEXT, DIM, HIDDEN = 4, 10, 64


def save_params(params, path):
    """Write the weights to a JSON file, so the next run can read them back."""
    with open(path, "w") as weights_file:
        json.dump({name: value.tolist() for name, value in params.items()}, weights_file)


def load_params(path):
    """Read weights written by save_params."""
    with open(path) as weights_file:
        return {name: np.array(value) for name, value in json.load(weights_file).items()}
