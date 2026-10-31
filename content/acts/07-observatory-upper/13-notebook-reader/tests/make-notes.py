import numpy as np


def load(ctx):
    m = ctx.module()
    for name in ("load_notes", "split_notes", "build_vocab", "windows"):
        if not callable(getattr(m, name, None)):
            raise CheckFailed(f"There is no function called {name}.")
    return m


def pair(what, got):
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed(f"{what} should return a pair.", actual=repr(got)[:120])
    return got


def every_fifth(ctx):
    m = load(ctx)
    notes = [f"note {n}" for n in range(1, 13)]
    learn, held = pair("split_notes", m.split_notes(notes))
    if list(held) != ["note 5", "note 10"]:
        raise CheckFailed("Twelve notes: the 5th and the 10th are held back.", expected=["note 5", "note 10"], actual=repr(held))
    if list(learn) != [n for n in notes if n not in ("note 5", "note 10")]:
        raise CheckFailed("The other ten are to learn from, in order.", actual=repr(learn))


def two_letters(ctx):
    m = load(ctx)
    X, y = pair("windows", m.windows(["ab"], ["\n", "a", "b"], 2))
    X, y = np.asarray(X), np.asarray(y)
    if X.tolist() != [[0, 0], [0, 1], [1, 2]] or y.tolist() != [1, 2, 0]:
        raise CheckFailed("windows([\"ab\"], [\"\\n\", \"a\", \"b\"], 2): newlines before the note, the newline after it.",
                          expected="X [[0, 0], [0, 1], [1, 2]], y [1, 2, 0]", actual=f"X {X.tolist()}, y {y.tolist()}")


def the_file(ctx):
    m = load(ctx)
    notes = m.load_notes()
    if notes is None or len(notes) != 85:
        raise CheckFailed("notes.txt holds 85 notes.", expected=85, actual=None if notes is None else len(notes))
    if any(not note or "\n" in note for note in notes):
        raise CheckFailed("Each note should be a whole line, without its newline, and none empty.")
    if not notes[0].startswith("Build it ugly") or not notes[-1].endswith("P."):
        raise CheckFailed("The notes should come in the order they are in the file.", actual=repr(notes[0][:30]))


def vocab(ctx):
    m = load(ctx)
    got = m.build_vocab(["ba", "ab c"])
    if list(got) != ["\n", " ", "a", "b", "c"]:
        raise CheckFailed("build_vocab([\"ba\", \"ab c\"]): every character once, the newline too, sorted.",
                          expected=["\n", " ", "a", "b", "c"], actual=repr(got))
    if len(m.build_vocab(m.load_notes())) != 55:
        raise CheckFailed("The notes use 54 characters, so with the newline the vocabulary has 55.", expected=55, actual=len(m.build_vocab(m.load_notes())))


def real_windows(ctx):
    m = load(ctx)
    notes = m.load_notes()
    learn, held = m.split_notes(notes)
    vocab = m.build_vocab(notes)
    X, y = pair("windows", m.windows(learn, vocab, 4))
    X, y = np.asarray(X), np.asarray(y)
    if X.shape != (7784, 4) or y.shape != (7784,):
        raise CheckFailed("The notes to learn from make 7784 windows of 4: one per character, and one per note for its newline.",
                          expected="(7784, 4) and (7784,)", actual=f"{X.shape} and {y.shape}")
    first = "".join(vocab[i] for i in X[0]) + vocab[y[0]]
    if first != "\n\n\n\nB":
        raise CheckFailed("The first window is four newlines, and its target is the B of 'Build'.", actual=repr(first))


def one_back(ctx):
    m = load(ctx)
    X, y = pair("windows", m.windows(["fog", "ok"], ["\n", "f", "g", "k", "o"], 1))
    X, y = np.asarray(X), np.asarray(y)
    want_X = [[0], [1], [4], [2], [0], [4], [3]]
    want_y = [1, 4, 2, 0, 4, 3, 0]
    if X.tolist() != want_X or y.tolist() != want_y:
        raise CheckFailed("Windows of 1 over two notes: each note starts afresh after a newline.",
                          expected=f"X {want_X}, y {want_y}", actual=f"X {X.tolist()}, y {y.tolist()}")


def program(ctx):
    r = ctx.run_program()
    if r.error is not None:
        raise CheckFailed(f"The program crashed: {type(r.error).__name__}: {r.error}")
    if "85 notes: 68 to learn from, 17 held back" not in r.output:
        raise CheckFailed("The program should say how the notes were split.", expected="85 notes: 68 to learn from, 17 held back", actual=r.output)


TESTS = [
    custom("Every fifth note held back", every_fifth, visible=True),
    custom("Windows over one short note", two_letters, visible=True,
           hint="Pad the front of each note with context newlines, add a newline at the end, then slide along it."),
    custom("All 85 notes, in order", the_file),
    custom("The vocabulary includes the newline", vocab),
    custom("Windows over the notes to learn from", real_windows),
    custom("Each note starts afresh", one_back,
           hint="Make the windows note by note, so the end of one note never leaks into the start of the next."),
    custom("The program", program),
]
