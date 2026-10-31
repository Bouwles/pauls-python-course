"""A gate on the memory, from the last page of Neil's notebook."""

import numpy as np


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def step(x, h, params):
    """The plain recurrent step, for comparison. Returns the new hidden state."""
    return np.tanh(x * params["Wx"] + h @ params["Wh"] + params["b"])


def lstm_step(x, h, c, params):
    """One hour of an LSTM. params["W"], params["U"] and params["b"] hold the four
    gates side by side, in the order forget, input, output, candidate.
    Returns (h, c)."""


if __name__ == "__main__":
    hidden = 2
    plain = {"Wx": np.zeros(hidden), "Wh": np.eye(hidden) * 0.9, "b": np.zeros(hidden)}
    # Forget gate held open, input gate held shut: the cell should keep what it has
    gated = {"W": np.zeros(4 * hidden), "U": np.zeros((hidden, 4 * hidden)),
             "b": np.concatenate([np.full(hidden, 6.0), np.full(hidden, -6.0), np.zeros(hidden), np.zeros(hidden)])}

    h_plain = np.array([0.8, -0.5])
    h, c = np.zeros(hidden), np.array([0.8, -0.5])
    for hour in range(48):
        h_plain = step(0.0, h_plain, plain)
        h, c = lstm_step(0.0, h, c, gated)
    print("After 48 quiet hours")
    print("  plain memory:", np.round(h_plain, 3) + 0.0)
    print("  LSTM cell:   ", np.round(c, 3) + 0.0)
