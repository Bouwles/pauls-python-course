---
id: predict-name
type: predict
title: What's my name
concept: main-guard
code: |
  print(__name__)
question: "Run directly, as the program itself, what does this print?"
options:
  - text: "__main__"
    correct: true
    feedback: "Right. A file run as the program is called `__main__`, whatever its file name."
  - text: "main"
    misconception: name-is-filename
    feedback: "It's a sensible guess, but `__name__` doesn't come from the file name when the file is run directly. It's `__main__`, underscores and all."
  - text: "main.py"
    misconception: name-is-filename
    feedback: "The file name only matters when the file is imported. Run directly, `__name__` is `__main__`."
  - text: A NameError
    misconception: name-needs-defining
    feedback: "Python sets `__name__` in every file before the first line runs. Nobody has to define it."
after: |
  Run it. When this same file is imported by another program, `__name__` holds something else. The next steps show what.
---
Every Python file gets a few names for free. `__name__` is one of them: two underscores each side, said *dunder name*.

Commit to an answer, then run it.
