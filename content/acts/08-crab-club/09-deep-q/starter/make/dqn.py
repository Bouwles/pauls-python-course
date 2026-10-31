# Deep Q: the crab's Q-values from a small network instead of a table.

import numpy as np

from track import ACTIONS, RACING, START, TRACK, average_return, draw, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def features(tile):
    """Seven numbers for a tile: which of the three rows, then which of the four columns."""


def new_params(rng, hidden=16):
    """Small random weights: seven features in, a hidden layer, four Q-values out."""
    inputs = ROWS + COLS
    return {
        "W1": rng.normal(0, 1 / np.sqrt(inputs), (inputs, hidden)),
        "b1": np.zeros(hidden),
        "W2": rng.normal(0, 1 / np.sqrt(hidden), (hidden, 4)),
        "b2": np.zeros(4),
    }


def q_values(params, X):
    """The network: one row of four Q-values (up, down, left, right) for each row of X."""


def gradients(params, X, actions, y):
    """Riya's, fixed. The loss, the mean squared TD error on the moves taken,
    and its gradient for every weight. Only the moves taken are to blame."""
    Z1 = X @ params["W1"] + params["b1"]
    H = np.maximum(0, Z1)
    Q = H @ params["W2"] + params["b2"]
    n = len(X)
    rows = np.arange(n)
    chosen = Q[rows, actions]
    loss = np.mean((chosen - y) ** 2)
    dQ = np.zeros_like(Q)
    dQ[rows, actions] = 2 * (chosen - y) / n
    dH = dQ @ params["W2"].T
    dZ1 = dH * (Z1 > 0)
    return loss, {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dQ, "b2": dQ.sum(axis=0)}


class ReplayBuffer:
    """The crab's memories of single moves, the oldest forgotten first."""

    def __init__(self, capacity):
        pass

    def __len__(self):
        return 0

    def add(self, tile, action, reward, after, over):
        """Remember every move."""

    def sample(self, size, rng):
        """Pick a batch of size different memories at random, not in order."""


def targets(target_params, rewards, X_after, overs, gamma=0.9):
    """What each move should have been worth, by the frozen copy's reckoning."""


def train_step(params, target_params, batch, gamma=0.9, rate=0.05):
    """One step of gradient descent on a batch of memories. Returns the loss before the step."""
    # Turn the batch into arrays
    # Work out the targets with the frozen copy
    # Nudge the guesses for the moves taken


def epsilon_at(episode, decay=100):
    """Explore less as it learns: 1.0 at the first race, down to 0.05 at race decay, then 0.05."""


def copy_params(params):
    """A frozen copy: new arrays, so training params leaves it alone."""


def greedy(params):
    """The move with the biggest Q-value on every tile still racing."""
    q = q_values(params, np.array([features(tile) for tile in RACING]))
    return {tile: ACTIONS[int(np.argmax(row))] for tile, row in zip(RACING, q)}


def train(episodes, rng, batch_size=32, sync_every=50, capacity=2000, gamma=0.9, rate=0.05, watch=False):
    """Deep Q on the racing grid. Returns the trained params."""
    # Start with new params, a frozen copy, and an empty buffer
    # For each race: explore less as it learns, then for each move:
    #     choose (at random with chance epsilon, otherwise the biggest Q-value)
    #     remember every move
    #     once there are batch_size memories, one train_step on a batch picked at random
    #     refresh the frozen copy every sync_every moves
    # If watch, draw the grid after each race.


if __name__ == "__main__":
    rng = np.random.default_rng(7)
    # Train for 150 races, watching. Show the network's line, its average
    # return over 1000 races, and a crab who moves at random.
    pass
