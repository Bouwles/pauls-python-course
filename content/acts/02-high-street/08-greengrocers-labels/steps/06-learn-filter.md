---
id: learn-filter
type: learn
title: Keeping only some
concept: conditional-comprehensions
code: |
  rounds = ["Music", "Food", "Music", "Games"]
  music = [name for name in rounds if name == "Music"]
  print(music)

  scores = [7, 0, 9, 4]
  print([score for score in scores if score > 5])
---
An `if` at the end of a comprehension keeps only the items that pass it. `[name for name in rounds if name == "Music"]` means: each `name`, but only if it's `"Music"`.

It's a filter. Caitlin's quiz needs one to pick out the questions in the round someone chose.

Python goes through the items in order. Any item that fails the test is left out of the new list altogether, so the new list can be shorter than the old one. The example prints `['Music', 'Music']`, then `[7, 9]`.

The usual slip is to put this `if` before the `for`. With no `else`, an `if` there is a SyntaxError. An `if` that only decides what gets in goes at the end.
