---
id: learn-with
type: learn
title: Reading a file
concept: with-statement
code: |
  with open("jobs.txt") as book:
      text = book.read()

  print(text)
  print(len(text), "characters")
---
`open("jobs.txt")` opens a file so your program can read it. `.read()` gives back everything in it as one string.

Aaesha's book is in a file, `alice.txt`. It's far too long to type in.

Open files with `with`. `with open("jobs.txt") as book:` keeps the file open for the indented block and closes it when the block ends, even if something inside goes wrong. `book` is the open file, and what you read into `text` is still there after the block. A `for` loop over an open file gives one line at a time instead.

The example prints Paul's repair book, then its length.

The usual slip is opening a file that isn't there. Python stops with a FileNotFoundError.
