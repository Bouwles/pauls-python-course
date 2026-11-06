---
id: learn-slicing
type: learn
title: Counting characters
concept: string-slicing
code: |
  room = "Workshop2019"
  print(len(room))
  print(room[0], room[-1])
  print(room[:4])
  print(room[-4:])
---
`len()` counts the characters in a string: letters, digits, spaces, everything. `len("Clock0314")` is `9`.

Each character has a position, counted from 0. So with `room = "Workshop2019"`, `room[0]` is `W`. Negative positions count back from the end: `room[-1]` is `9`, the last character.

A **slice** takes a run of characters: `room[0:4]` is `Work`. It stops just before its second number. Leave a number out to run to the edge: `room[:4]` is the first four, and `room[-4:]` the last four, `2019`.

A single position past the end, like `room[12]`, stops with an IndexError. A slice past the end just stops at the end.

The usual mistake is counting from 1. The first character is at position 0.
