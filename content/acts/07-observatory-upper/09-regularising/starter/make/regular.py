"""Regularising the seeing network: weight decay, dropout and early stopping."""

import numpy as np

from net import backward, forward, init_params, load_nights, mse


def dropout_mask(shape, rate, rng):
    """Each entry 0 with chance rate, otherwise 1 / (1 - rate)."""


def with_weight_decay(grads, params, decay):
    """New gradients: decay times each weight matrix added to its gradient. Biases untouched."""


# Stopped it the winter it was best, and kept those weights in a drawer.
# It went on learning anyway. It is very hard to tell a thing to stop. A.P.
def train(X, T, X_val, T_val, params, rate, epochs, decay=0.0, drop=0.0, patience=None, seed=0):
    """Gradient descent with weight decay, dropout and early stopping.
    Changes params in place. Returns (train_losses, val_losses, best)."""
    # One step downhill, with some of the hidden layer asleep
    # Score it, with every neuron awake, on both sets of nights
    # A new best: note when, and keep a copy
    # Out of patience: stop
    # Put the best weights back


if __name__ == "__main__":
    X, T, X_val, T_val = load_nights()
    runs = [
        ("Pip's", {}),
        ("weight decay 0.02", {"decay": 0.02}),
        ("dropout 0.5", {"drop": 0.5}),
        ("early stopping", {"patience": 100}),
    ]
    print(f"{'':20}{'training':>10}{'validation':>12}")
    for label, settings in runs:
        params = init_params(6, 64)
        train_losses, val_losses, best = train(X, T, X_val, T_val, params, 0.1, 3000, **settings)
        last = best if "patience" in settings else -1
        print(f"{label:20}{train_losses[last]:>10.4f}{val_losses[last]:>12.4f}")
    guess = np.full_like(T_val, T.mean())
    print(f"{'Guessing the average':20}{'':>10}{mse(guess, T_val):>12.4f}")
