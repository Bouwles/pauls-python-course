"""The notes, as numbers: loading, holding some back, the vocabulary, the windows.

load_notes(path="notes.txt")     every note in the file, one per line, without its newline
split_notes(notes)               (learn, held_back): every fifth note held back
build_vocab(notes)               every character in the notes once, and the newline, sorted
windows(notes, vocab, context)   (X, y): for every character of every note, and the newline
                                 that ends it, the ids of the context characters before it
                                 (newlines before the note starts) and its own id
"""

import numpy as np

NEWLINE = "\n"
