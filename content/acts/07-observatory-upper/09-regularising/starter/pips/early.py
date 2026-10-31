"""Riya's early stopping. It stops when it stops getting better, and keeps the best."""

from net import backward, forward, init_params, load_nights, mse


def train_with_patience(X, T, X_val, T_val, params, rate, epochs, patience):
    """Gradient descent that stops after `patience` epochs without a new best,
    then puts the best weights back. Returns (train_losses, val_losses, best)."""
    train_losses, val_losses = [], []
    best, best_loss, best_params = 0, float("inf"), None
    for epoch in range(epochs):
        P, cache = forward(X, params)
        grads = backward(X, T, params, cache)
        for name in params:
            params[name] -= rate * grads[name]
        train_losses.append(mse(forward(X, params)[0], T))
        val_losses.append(mse(forward(X_val, params)[0], T_val))
        if train_losses[-1] < best_loss:
            best, best_loss = epoch, train_losses[-1]
            best_params = params.copy()
        elif epoch - best >= patience:
            break
    params.update(best_params)
    return train_losses, val_losses, best


if __name__ == "__main__":
    X, T, X_val, T_val = load_nights()
    params = init_params(6, 64)
    train_losses, val_losses, best = train_with_patience(X, T, X_val, T_val, params, 0.1, 3000, patience=100)
    print(f"Ran {len(val_losses)} epochs. Best: epoch {best}, validation {val_losses[best]:.4f}")
    print(f"The weights it handed back: validation {mse(forward(X_val, params)[0], T_val):.4f}")
