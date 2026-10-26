"""Pip's tide checker: run Penhallow's network over the roll and see how far out it is."""

import csv
import json

import numpy as np

MEAN, SCALE = 2.5, 2.0      # readings go in as (height - MEAN) / SCALE


def load_tides(path="tides.csv"):
    with open(path) as tide_file:
        return np.array([float(row["height"]) for row in csv.DictReader(tide_file)])


def load_weights(path="rnn_weights.json"):
    with open(path) as weights_file:
        return {name: np.array(value) for name, value in json.load(weights_file).items()}


def step(x, h, params):
    """One hour. Returns (h, guess). Wendt's, and it works."""
    h = np.tanh(x * params["Wx"] + h @ params["Wh"] + params["b"])
    return h, float(h @ params["Wy"] + params["by"])


def run(xs, params):
    """Every reading in order, from an empty memory. Returns (hiddens, guesses)."""
    h = np.zeros(len(params["b"]))
    hiddens, guesses = [], []
    for x in xs:
        h, guess = step(x, h, params)
        hiddens.append(h)
        guesses.append(guess)
    return np.array(hiddens), np.array(guesses)


def one_hour_error(heights, params):
    """How far out the guesses are on average, in metres: each guess against the next hour."""
    xs = (heights - MEAN) / SCALE
    hiddens, guesses = run(xs, params)
    return np.mean(np.abs(guesses[:-1] * SCALE + MEAN - heights[1:]))


if __name__ == "__main__":
    heights = load_tides()
    params = load_weights()
    print(f"Out by {one_hour_error(heights, params) * 100:.1f} cm on average")
