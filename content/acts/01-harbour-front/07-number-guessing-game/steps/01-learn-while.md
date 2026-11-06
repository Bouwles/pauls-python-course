---
id: learn-while
type: learn
title: Repeat while it's true
concept: while-loops
code: |
  count = 3
  while count > 0:
      print(count)
      count = count - 1
  print("Go")
---
A `while` loop repeats the indented lines under it for as long as its test, the comparison after `while`, is `True`.

You need one when you can't know the number of passes in advance. A `for` loop counts its passes before it starts. A guessing game can't: it goes on until someone gets the number.

Python asks the test at the top, before every pass. When the answer is `False`, it jumps to the first line after the loop. The example prints `3`, `2`, `1`, then `Go`.

The usual slip is to read `while` like `if`. An `if` runs its lines once. A `while` goes back to the top after every pass and asks again.

Change line 1 to `count = 5` and run it.
