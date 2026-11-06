---
id: learn-split
type: learn
title: Cutting a line into pieces
concept: split-join
code: |
  line = "Aaesha, 01632 960733, The Engine Room"
  parts = line.split(", ")
  print(parts)
  print(parts[0])
  words = "Print Shop".split()
  print(words)
  print("Shop" in words)
---
`.split()` cuts a string into a list of pieces. `line.split(", ")` cuts at every comma and space, and throws those away.

New contacts will arrive as one typed line, and the program needs the name, phone and address apart.

With nothing in the brackets, `.split()` cuts at the spaces, which turns a name into its words. Then `in` asks whether a word is one of the items: `"Shop" in words` is `True`. The example prints the three parts, the first part, the two words, then `True`.

Methods can follow one another. `"Print Shop".lower().split()` lowers the name, then splits what that gives: `['print', 'shop']`.

The usual slip is `line.split(",")` without the space. It leaves a space at the start of every piece after the first.
