"""Penhallow's notes, as numbers: loading, holding some back, the vocabulary, the windows."""

import numpy as np

NEWLINE = "\n"


def load_notes(path="notes.txt"):
    """Every note in the file, one per line, without its newline."""
    with open(path) as notes_file:
        return [line for line in notes_file.read().split(NEWLINE) if line]


def split_notes(notes):
    """Every fifth note (the 5th, the 10th, and so on) held back; the rest to learn from.
    Returns (learn, held_back)."""
    learn = [note for number, note in enumerate(notes, start=1) if number % 5 != 0]
    held_back = [note for number, note in enumerate(notes, start=1) if number % 5 == 0]
    return learn, held_back


def build_vocab(notes):
    """Every character in the notes once, and the newline, sorted."""
    return sorted(set("".join(notes)) | {NEWLINE})


def windows(notes, vocab, context):
    """For every character of every note, and the newline that ends it: the ids of the
    `context` characters before it, padded with newlines at the start of the note, and
    its own id. Returns (X, y): X is (n, context), y is (n,)."""
    index = {char: i for i, char in enumerate(vocab)}
    X, y = [], []
    for note in notes:
        ids = [index[NEWLINE]] * context + [index[char] for char in note] + [index[NEWLINE]]
        for end in range(context, len(ids)):
            X.append(ids[end - context:end])
            y.append(ids[end])
    return np.array(X), np.array(y)


if __name__ == "__main__":
    notes = load_notes()
    learn, held_back = split_notes(notes)
    vocab = build_vocab(notes)
    X, y = windows(learn, vocab, 4)
    print(f"{len(notes)} notes: {len(learn)} to learn from, {len(held_back)} held back")
    print(f"{len(vocab)} characters")
    print(f"{len(y)} windows of 4 to learn from")
    print("Window 6:", [vocab[i] for i in X[5]], "->", repr(vocab[y[5]]))
