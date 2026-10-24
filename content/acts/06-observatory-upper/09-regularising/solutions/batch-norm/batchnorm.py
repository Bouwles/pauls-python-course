"""Every hidden neuron on the same scale, whatever the readings were measured in."""

import numpy as np


def batch_norm(Z, gamma, beta, running, training, momentum=0.9, eps=1e-5):
    """Each column of Z brought to mean 0 and standard deviation 1, then scaled by gamma and shifted by beta.
    Training: use this batch's numbers, and fold them into running["mean"] and running["var"].
    Evaluation: use the running numbers, and leave them alone."""
    if training:
        mean = Z.mean(axis=0)
        var = Z.var(axis=0)
        running["mean"] = momentum * running["mean"] + (1 - momentum) * mean
        running["var"] = momentum * running["var"] + (1 - momentum) * var
    else:
        mean = running["mean"]
        var = running["var"]
    return gamma * (Z - mean) / np.sqrt(var + eps) + beta


if __name__ == "__main__":
    # Four evenings straight from the log: visibility in metres, wind in knots
    evenings = np.array([[3000.0, 12.0], [200.0, 30.0], [50.0, 2.0], [1500.0, 18.0]])
    W1 = np.array([[0.002, -0.001, 0.0005], [0.1, 0.3, -0.2]])
    Z = evenings @ W1

    gamma, beta = np.ones(3), np.zeros(3)
    running = {"mean": np.zeros(3), "var": np.ones(3)}
    print("Before:", np.round(Z.mean(axis=0), 2), np.round(Z.std(axis=0), 2))
    out = batch_norm(Z, gamma, beta, running, training=True)
    print("After: ", np.round(out.mean(axis=0), 2) + 0.0, np.round(out.std(axis=0), 2))

    for _ in range(50):
        batch_norm(Z, gamma, beta, running, training=True)
    tonight = np.array([[800.0, 25.0]]) @ W1
    print("Tonight:", np.round(batch_norm(tonight, gamma, beta, running, training=False), 2))
