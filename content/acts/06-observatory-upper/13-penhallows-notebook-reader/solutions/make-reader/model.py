"""A small network that reads four characters and guesses the fifth."""

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


def init_model(size, context=CONTEXT, dim=DIM, hidden=HIDDEN, seed=0):
    """Small random weights: E, then W1, b1, W2, b2."""
    rng = np.random.default_rng(seed)
    return {
        "E": rng.normal(0, 1, (size, dim)),
        "W1": rng.normal(0, 1 / np.sqrt(context * dim), (context * dim, hidden)),
        "b1": np.zeros(hidden),
        "W2": rng.normal(0, 1 / np.sqrt(hidden), (hidden, size)),
        "b2": np.zeros(size),
    }


def softmax(scores):
    """Chances along each row."""
    exps = np.exp(scores - scores.max(axis=1, keepdims=True))
    return exps / exps.sum(axis=1, keepdims=True)


def forward(X, params):
    """The chances of every next character, one row per window, and what backward needs."""
    # Look up each character's embedding, and lay a window's out in one row
    flat = params["E"][X].reshape(len(X), -1)
    # A tanh layer, then a score for every character, then softmax
    H = np.tanh(flat @ params["W1"] + params["b1"])
    P = softmax(H @ params["W2"] + params["b2"])
    return P, {"flat": flat, "H": H, "P": P}


def loss(P, y):
    """The average of minus the log of the chance of each real next character."""
    return float(-np.mean(np.log(P[np.arange(len(y)), y])))


def backward(X, y, params, cache):
    """The gradient of the loss for every weight, keyed like params."""
    flat, H, P = cache["flat"], cache["H"], cache["P"]
    # Chances minus the answers
    d_scores = P.copy()
    d_scores[np.arange(len(y)), y] -= 1
    d_scores /= len(y)
    # Back through the second layer and the tanh
    d_W2 = H.T @ d_scores
    d_b2 = d_scores.sum(axis=0)
    d_Z = (d_scores @ params["W2"].T) * (1 - H ** 2)
    # Back through the first layer, to each window's row of embeddings
    d_W1 = flat.T @ d_Z
    d_b1 = d_Z.sum(axis=0)
    d_flat = d_Z @ params["W1"].T
    # Each embedding gets the blame from every place its character appeared
    d_E = np.zeros_like(params["E"])
    np.add.at(d_E, X, d_flat.reshape(X.shape[0], X.shape[1], -1))
    return {"E": d_E, "W1": d_W1, "b1": d_b1, "W2": d_W2, "b2": d_b2}


def train(X, y, params, rate, steps, batch=64, seed=0):
    """Mini-batch gradient descent. Changes params in place; returns each batch's loss."""
    rng = np.random.default_rng(seed)
    losses = []
    for _ in range(steps):
        rows = rng.integers(0, len(X), batch)
        P, cache = forward(X[rows], params)
        losses.append(loss(P, y[rows]))
        grads = backward(X[rows], y[rows], params, cache)
        for name in params:
            params[name] -= rate * grads[name]
    return losses


def model_chances(X, y, params):
    """The chance the model gives each window's real next character."""
    P, _ = forward(X, params)
    return P[np.arange(len(y)), y]


if __name__ == "__main__":
    notes = load_notes()
    learn, held_back = split_notes(notes)
    vocab = build_vocab(notes)
    X, y = windows(learn, vocab, CONTEXT)
    X_held, y_held = windows(held_back, vocab, CONTEXT)

    params = init_model(len(vocab))
    losses = train(X, y, params, rate=0.3, steps=2000)
    for step in range(0, 2000, 500):
        print(f"Steps {step} to {step + 99}: loss {np.mean(losses[step:step + 100]):.3f}")
    print(f"Steps 1900 to 1999: loss {np.mean(losses[1900:]):.3f}")

    bigram = perplexity(bigram_chances(bigram_probs(X, y, len(vocab)), X_held, y_held))
    print(f"Held-back notes: perplexity {perplexity(model_chances(X_held, y_held, params)):.2f}, "
          f"bigram {bigram:.2f}, guessing {len(vocab)}")
    save_params(params, "my_weights.json")
    print("Saved my_weights.json")
