---
id: learn-returns
type: learn
title: Two answers from one function
concept: multiple-returns
code: |
  def split_pence(total):
      return total // 100, total % 100

  print(split_pence(1060))
  pounds, pence = split_pence(1060)
  print(pounds, "pounds and", pence, "pence")
---
A function can hand back several values at once. Write them after `return` with commas between: `return total // 100, total % 100`.

Caitlin's `longest_leg` has to give back a name and a number together, and one `return` can do it.

The values travel as one tuple, so `print(split_pence(1060))` shows `(10, 60)`. Unpack the call where it lands, `pounds, pence = split_pence(1060)`, and each value gets a name of its own. The example prints `(10, 60)`, then `10 pounds and 60 pence`.

The usual slip is to write two `return` lines, one under the other. The first one ends the function, so the second never runs.
