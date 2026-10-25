"""Penhallow's notebook reader: give it the start of a note, and it finishes it.

complete(start, params, vocab, rng, temperature=1.0, limit=200)
    the note that begins with start, carried on a character at a time until the model
    chooses a newline or has added limit characters; temperature 0 always takes the likeliest

Run as a program: your weights from my_weights.json if you've trained them, Wendt's from
trained.json if not, and three notes finished.
"""

import os

import numpy as np

from model import CONTEXT, forward, load_params
from notes import NEWLINE, build_vocab, load_notes


# If a machine can finish my sentences, I can stop writing them.
# I am not sure that is the good news I meant it to be. A.P.
