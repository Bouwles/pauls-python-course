"""Tiny GPT: a character-level transformer that writes in the style of Jerome K.
Jerome's Three Men in a Boat (1889), using your attention and your block.

load_gpt(path)              (params, vocab): the trained weights (written for
                            you). params["blocks"] is a list with one params
                            dict per block, in the form transformer_block takes
embed(ids, params)          E[id] + P[position] for every id in a list of
                            character ids: one row per character
next_scores(ids, params)    the scores for the character after ids: embed,
                            then every block in turn, then layer_norm with
                            lnf_gain and lnf_shift, then the last row
                            @ W_out + b_out: one score per vocabulary character
sample_next(scores, temperature, rng)
                            one id, drawn with rng.choice(len(scores),
                            p=softmax(scores / temperature))
generate(start, params, vocab, length, temperature, rng)
                            start, then length more characters, each chosen
                            from the scores for the last CONTEXT characters
                            written so far (or all of them, if fewer)

Run as a program, it writes three passages with
rng = np.random.default_rng(308), 80 characters after each start, at a
temperature of 0.5:
the river to day, and the strange of the work the busin't so a morning from before on the
george said, and a not a sing to much as real the partice, and the man who had the sland wa
montmorency would have stopped half a man on the back that it was a since to be in a methin
"""
import json

import numpy as np

from attention import softmax
from block import layer_norm, transformer_block

STARTS = ["the river", "george said", "montmorency"]
LENGTH = 80
TEMPERATURE = 0.5


def load_gpt(path="gpt_weights.json"):
    """The trained weights, and the vocabulary."""
    with open(path) as weights_file:
        raw = json.load(weights_file)
    params = {name: np.array(raw[name]) for name in ("E", "P", "lnf_gain", "lnf_shift", "W_out", "b_out")}
    params["blocks"] = []
    for block in raw["blocks"]:
        layer = {name: np.array(value) for name, value in block.items() if name != "heads"}
        layer["heads"] = [tuple(np.array(head[name]) for name in ("Wq", "Wk", "Wv")) for head in block["heads"]]
        params["blocks"].append(layer)
    return params, raw["vocab"]


def embed(ids, params):
    # Look up each character, and add where it sits
    return params["E"][ids] + params["P"][:len(ids)]


def next_scores(ids, params):
    # Through every block in turn
    X = embed(ids, params)
    for block in params["blocks"]:
        X = transformer_block(X, block)
    # Normalise, and score every character from the last row
    X = layer_norm(X, params["lnf_gain"], params["lnf_shift"])
    return X[-1] @ params["W_out"] + params["b_out"]


def sample_next(scores, temperature, rng):
    # Sharpen or soften, then draw
    return int(rng.choice(len(scores), p=softmax(scores / temperature)))


def generate(start, params, vocab, length, temperature, rng):
    context = len(params["P"])
    ids = [vocab.index(char) for char in start]
    for step in range(length):
        # Only the last CONTEXT characters fit
        scores = next_scores(ids[-context:], params)
        ids.append(sample_next(scores, temperature, rng))
    return "".join(vocab[i] for i in ids)


if __name__ == "__main__":
    params, vocab = load_gpt()
    rng = np.random.default_rng(308)
    for start in STARTS:
        print(generate(start, params, vocab, LENGTH, TEMPERATURE, rng))
