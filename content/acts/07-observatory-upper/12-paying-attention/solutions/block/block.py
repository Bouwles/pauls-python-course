"""One transformer block: attention, then a small network, each added back on."""

import json

import numpy as np

from attention import self_attention


def load_block(path="block_weights.json"):
    """The weights for one block, with the character and position tables, and the vocabulary."""
    with open(path) as weights_file:
        raw = json.load(weights_file)
    params = {name: np.array(value) for name, value in raw.items() if name not in ("heads", "vocab")}
    params["heads"] = [tuple(np.array(head[name]) for name in ("Wq", "Wk", "Wv")) for head in raw["heads"]]
    return params, raw["vocab"]


def multi_head(X, heads, Wo, causal=True):
    """Every head's self-attention output, side by side, then through Wo."""
    outputs = [self_attention(X, Wq, Wk, Wv, causal)[0] for Wq, Wk, Wv in heads]
    return np.concatenate(outputs, axis=1) @ Wo


def layer_norm(X, gain, shift, eps=1e-5):
    """Each row brought to mean 0 and spread 1, then scaled by gain and shifted by shift."""
    mean = X.mean(axis=1, keepdims=True)
    var = X.var(axis=1, keepdims=True)
    return gain * (X - mean) / np.sqrt(var + eps) + shift


def feed_forward(X, W1, b1, W2, b2):
    """A small two-layer network with a ReLU, applied to every row on its own."""
    return np.maximum(0, X @ W1 + b1) @ W2 + b2


def transformer_block(X, params):
    """Attention, then the feed-forward network, each added back on to what came in."""
    # Normalise, attend, and add it back on
    X = X + multi_head(layer_norm(X, params["ln1_gain"], params["ln1_shift"]), params["heads"], params["Wo"])
    # Normalise, think about each character on its own, and add that back on
    return X + feed_forward(layer_norm(X, params["ln2_gain"], params["ln2_shift"]),
                            params["W1"], params["b1"], params["W2"], params["b2"])


if __name__ == "__main__":
    params, vocab = load_block()
    text = "the hill."
    X = params["E"][[vocab.index(char) for char in text]] + params["P"][:len(text)]
    out = transformer_block(X, params)
    print("In:", X.shape, " Out:", out.shape)

    normed = layer_norm(X, params["ln1_gain"], params["ln1_shift"])
    _, weights = self_attention(normed, *params["heads"][0])
    print("Where the full stop looks, in the first head:")
    print("  " + "  ".join(f"{char!r} {weight:.2f}" for char, weight in zip(text, weights[-1])))

    other = "the hilly"
    Y = params["E"][[vocab.index(char) for char in other]] + params["P"][:len(other)]
    changed = transformer_block(Y, params)
    print("Changing the last character changes only the last row:",
          bool(np.allclose(out[:-1], changed[:-1]) and not np.allclose(out[-1], changed[-1])))
