"""Reading Penhallow's handwriting: ten answers, and only one of them right."""

import numpy as np

from training import Adam, batches, init_params


# The machine on the hill learned to read my handwriting before Tom did.
# Tom says that isn't difficult. It reads my notebooks every night now,
# every number I ever wrote down, and it has never once asked what any
# of them were for. A.P.
def one_hot(labels, classes):
    """A row per label: 1 in that label's column, 0 everywhere else."""
    return np.eye(classes)[labels]


def softmax(Z):
    """Each row of scores into chances that add up to 1, however big the scores."""
    # Shift each row by its own biggest score
    shifted = Z - Z.max(axis=1, keepdims=True)
    # Exponentiate, then divide by the row's total
    exps = np.exp(shifted)
    return exps / exps.sum(axis=1, keepdims=True)


def cross_entropy(P, labels):
    """The mean, over the rows, of minus the log of the chance given to the right answer."""
    return -np.mean(np.log(P[np.arange(len(P)), labels]))


def relu(z):
    return np.maximum(0, z)


def forward(X, params):
    """Chances for each digit, one row per image, and the values backward needs."""
    Z1 = X @ params["W1"] + params["b1"]
    H = relu(Z1)
    # Scores: one column per digit
    Z2 = H @ params["W2"] + params["b2"]
    # Softmax them into chances
    P = softmax(Z2)
    return P, {"Z1": Z1, "H": H, "P": P}


def backward(X, labels, params, cache):
    """The gradient of the cross-entropy for every weight and bias, keyed like params."""
    Z1, H, P = cache["Z1"], cache["H"], cache["P"]
    # Blame at the scores: chances minus the one-hot answers, over n
    dZ2 = (P - one_hot(labels, P.shape[1])) / len(X)
    # Then back through the layers, as in Learning Backwards
    dZ1 = (dZ2 @ params["W2"].T) * (Z1 > 0)
    return {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0), "W2": H.T @ dZ2, "b2": dZ2.sum(axis=0)}


def accuracy(P, labels):
    """The fraction of rows whose biggest chance is on the right digit."""
    # Read off the answer: the biggest column
    return np.mean(P.argmax(axis=1) == labels)


def train(X, labels, params, optimiser, epochs, batch_size, rng):
    """Mini-batch training. Returns the cross-entropy on all of X after each epoch."""
    losses = []
    for _ in range(epochs):
        for X_batch, labels_batch in batches(X, labels, batch_size, rng):
            P, cache = forward(X_batch, params)
            optimiser.step(params, backward(X_batch, labels_batch, params, cache))
        losses.append(cross_entropy(forward(X, params)[0], labels))
    return losses


if __name__ == "__main__":
    from notebooks import load_notebook_digits

    images, labels = load_notebook_digits()
    X = images.reshape(len(images), 64) / 16          # 64 greys from 0 to 1 per digit

    order = np.random.default_rng(0).permutation(len(X))
    learn, held_back = order[:1500], order[1500:]    # 297 digits it never sees until the end

    params = init_params(64, 32, 10, np.random.default_rng(1))
    losses = train(X[learn], labels[learn], params, Adam(0.01), 15, 32, np.random.default_rng(2))
    print(f"Loss: {losses[0]:.3f} after the first epoch, {losses[-1]:.3f} after the last")

    P, _ = forward(X[held_back], params)
    read = int(round(accuracy(P, labels[held_back]) * len(held_back)))
    print(f"Read {read} of {len(held_back)} digits it had never seen")
    guesses = P.argmax(axis=1)
    wrong = [f"{true} as {guess}" for true, guess in zip(labels[held_back], guesses) if true != guess]
    print("Misread:", ", ".join(wrong))
