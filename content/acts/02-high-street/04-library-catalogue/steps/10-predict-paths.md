---
id: predict-paths
type: predict
title: Before you open it
concept: paths
code: |
  from pathlib import Path

  with open("shelf.txt", "w") as shelf:
      shelf.write("Emma\n")

  for name in ["shelf.txt", "shelf.text"]:
      book = Path(name)
      print(book.exists(), book.suffix)
question: What does this print?
options:
  - text: |-
      True .txt
      False .text
    correct: true
    feedback: "`.exists()` answers `False` for a missing file, with no error. `.suffix` is whatever follows the last dot, dot included, file or no file."
  - text: |-
      True txt
      False text
    misconception: suffix-without-dot
    feedback: "`.suffix` keeps the dot: `.txt`. `.stem` is the part before it."
  - text: |-
      True .txt
      then a FileNotFoundError
    misconception: exists-raises-if-missing
    error: FileNotFoundError
    feedback: "Only `open()` fails on a missing file. `.exists()` is how you ask first, so it just answers `False`."
---
The program writes `shelf.txt` first, so that one is there. Nobody has made a `shelf.text`.
