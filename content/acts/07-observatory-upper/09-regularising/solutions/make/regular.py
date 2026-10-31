"""Regularising the seeing network: weight decay, dropout and early stopping."""

import numpy as np

from net import backward, forward, init_params, load_nights, mse


def dropout_mask(shape, rate, rng):
    """Each entry 0 with chance rate, otherwise 1 / (1 - rate)."""
    return (rng.random(shape) >= rate) / (1 - rate)


def with_weight_decay(grads, params, decay):
    """New gradients: decay times each weight matrix added to its gradient. Biases untouched."""
    return {name: grad + decay * params[name] if name.startswith("W") else grad
            for name, grad in grads.items()}


def train(X, T, X_val, T_val, params, rate, epochs, decay=0.0, drop=0.0, patience=None, seed=0):
    """Gradient descent with weight decay, dropout and early stopping.
    Changes params in place. Returns (train_losses, val_losses, best)."""
    rng = np.random.default_rng(seed)
    train_losses, val_losses = [], []
    best, best_loss, best_params = 0, float("inf"), None
    for epoch in range(epochs):
        # One step downhill, with some of the hidden layer asleep
        keep = dropout_mask((len(X), params["b1"].size), drop, rng) if drop > 0 else None
        P, cache = forward(X, params, keep)
        grads = with_weight_decay(backward(X, T, params, cache), params, decay)
        for name in params:
            params[name] -= rate * grads[name]
        # Score it, with every neuron awake, on both sets of nights
        train_losses.append(mse(forward(X, params)[0], T))
        val_losses.append(mse(forward(X_val, params)[0], T_val))
        # A new best: note when, and keep a copy
        if val_losses[-1] < best_loss:
            best, best_loss = epoch, val_losses[-1]
            best_params = {name: value.copy() for name, value in params.items()}
        # Out of patience: stop
        elif patience is not None and epoch - best >= patience:
            break
    # Put the best weights back
    if patience is not None:
        for name in params:
            params[name][...] = best_params[name]
    return train_losses, val_losses, best


if __name__ == "__main__":
    X, T, X_val, T_val = load_nights()
    runs = [
        ("Riya's", {}),
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
