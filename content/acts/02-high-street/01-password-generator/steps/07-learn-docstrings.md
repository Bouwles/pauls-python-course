---
id: learn-docstrings
type: learn
title: Saying what it does
concept: docstrings
code: |
  def share(bill, people):
      """Return what each person pays."""
      return bill / people

  print(share(12.0, 4))
  print(share.__doc__)
---
A **docstring** is a string in triple quotes, `"""like this"""`, on the very first line inside a `def`. It says what the function does: what goes in, and what comes back.

Python keeps it with the function. `help(share)` shows it, and so does `share.__doc__`, so anyone can use the function without reading its body. Caitlin's brief asks for one in every function.

Triple quotes make a string that can run over several lines, so a longer docstring has room.

The example prints `3.0`, then the docstring: `Return what each person pays.`

The usual slip is to put it further down. Only a string on the first line inside the `def` is a docstring. Anywhere else it's a string that does nothing.
