---
id: learn-for
type: learn
title: Doing it again
concept: for-loops
code: |
  for tick in range(3):
      print("Tick")
  print("Still 3:14")
---
A **loop** repeats lines. `for tick in range(3):` means "do this three times". The lines under it, indented four spaces, are the loop's **body**, and they run once on every pass. (The name `tick` gets a step of its own soon.)

The first line back at the left edge isn't part of the loop. It runs once, after the last pass. So the program on the right prints `Tick` three times, then `Still 3:14` once.

Like `if`, the `for` line ends with a colon, and the indent shows what belongs to it.

The usual mistake is expecting the line after the loop to repeat as well. Only the indented lines repeat.
