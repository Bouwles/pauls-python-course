---
id: learn-paths
type: learn
title: Is the file there
concept: paths
code: |
  from pathlib import Path

  book = Path("alice.txt")
  print(book.exists())
  print(Path("alice.text").exists())
  print(book.name, book.stem, book.suffix)
---
A **path** is the name of a file, with the folders that lead to it. `Path`, from the `pathlib` module, is a file name that knows things about itself.

Aaesha's program asks which book to read. Someone will type `alice.text`, and it should say so, not stop with a FileNotFoundError.

`Path("alice.txt").exists()` is `True` if the file is there and `False` if it isn't. `.name` is the whole name, `.stem` the part before the dot, and `.suffix` the dot and what follows. The example prints `True`, `False`, then `alice.txt alice .txt`.

A name with no folder in front is looked for in the folder the program runs in, and nowhere else. The usual slip is to expect Python to search the whole computer for it.
