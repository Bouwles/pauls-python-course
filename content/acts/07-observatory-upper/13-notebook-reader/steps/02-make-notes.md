---
id: make-notes
type: make
title: The notes, as numbers
files: [notes.py]
entry: notes.py
on_pass: { aaesha: "Eighty-five notes, sixty-eight to learn from, seventeen in the drawer. And not a sentence cut in half." }
hints:
  nudge: "For a note like \"ab\" with windows of 2, write out by hand the three windows and the three targets. Where do the newlines go?"
  plan:
    - "load_notes: read the file, split it into lines, drop the empty ones"
    - "split_notes: count the notes from 1, and hold back every fifth"
    - "build_vocab: every character once, the newline too, sorted"
    - "windows: for each note, newlines in front and one at the end, as ids"
    - Slide along each note, a window and its target at a time
  shape: |
    def windows(notes, vocab, context):
        index = {char: i for i, char in enumerate(vocab)}
        X, y = [], []
        for note in notes:
            ids = [index[NEWLINE]] * ___ + [index[char] for char in note] + [___]
            for end in range(context, len(ids)):
                X.append(ids[___:end])
                y.append(ids[___])
        return np.array(X), np.array(y)
---
Write `notes.py`, from the docstring at the top.

Each window is the `context` characters before a target. At the start of a note there aren't enough characters, so the window is padded with newlines, the same character that ends every note. The model then learns how notes begin as well as how they end.

```
85 notes: 68 to learn from, 17 held back
55 characters
7784 windows of 4 to learn from
Window 6: ['u', 'i', 'l', 'd'] -> ' '
```

Build the vocabulary from all 85 notes. The held-back notes may use a character the others never do, and every character needs an id, even if the model has never seen what follows it.
