"""Penhallow's tide network: one reading an hour in, a guess at the next hour out."""

import csv
import json

import numpy as np

MEAN, SCALE = 2.5, 2.0      # readings go in as (height - MEAN) / SCALE


def load_tides(path="tides.csv"):
    """The harbour gauge, one height an hour, in metres."""
    with open(path) as tide_file:
        return np.array([float(row["height"]) for row in csv.DictReader(tide_file)])


def load_weights(path="rnn_weights.json"):
    """Penhallow's weights: Wx, Wh, b, Wy and by."""
    with open(path) as weights_file:
        return {name: np.array(value) for name, value in json.load(weights_file).items()}


# It carries the last hour into the next, and that one into the one after.
# By morning it remembers the whole night, a little. Tom says that's all
# any of us do. A.P.
def step(x, h, params):
    """One hour: the new hidden state from this reading and the last hidden state,
    and the guess at the next reading. Returns (h, guess)."""
    # Mix the new reading with the memory, and squash
    # Read the guess off the memory


def run(xs, params):
    """Every reading in order, from an empty memory. Returns (hiddens, guesses):
    one row of hidden state and one guess per reading."""
    # Start with an empty memory
    # Each reading in turn: one step
    # Keep every hidden state, and every guess


def forecast(xs, params, hours):
    """Read every reading, then guess `hours` readings ahead, feeding each guess
    back in as the next reading. Returns the guesses as an array."""
    # Read every reading
    # Feed each guess back in as if it were a reading


if __name__ == "__main__":
    heights = load_tides()
    params = load_weights()
    xs = (heights - MEAN) / SCALE

    hiddens, guesses = run(xs, params)
    network = np.mean(np.abs(guesses[:-1] * SCALE + MEAN - heights[1:]))
    same_again = np.mean(np.abs(heights[:-1] - heights[1:]))
    print(f"One hour ahead, over {len(heights) - 1} hours:")
    print(f"  the network is out by {network * 100:.1f} cm on average")
    print(f"  \"same as last hour\" is out by {same_again * 100:.1f} cm")

    ahead = forecast(xs, params, 6) * SCALE + MEAN
    print("Next six hours:", " ".join(f"{height:.2f}" for height in ahead))
