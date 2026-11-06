---
id: learn-own-errors
type: learn
title: An error of your own
concept: exceptions
code: |
  class MoneyError(Exception):
      """A broken money rule."""


  def check_amount(pence):
      if pence == 0:
          raise MoneyError("An amount can't be 0.")
      return pence


  try:
      check_amount(0)
  except MoneyError as refusal:
      print("Refused:", refusal)
---
You can make an error type of your own. `class MoneyError(Exception):` is a subclass of `Exception`, the parent of nearly every error in Python, so it can be raised and caught like any of them. The docstring is all the body it needs.

Caitlin's app refuses things for its own reasons: no sweets category, no spending that's secretly income. One error type for all of them means the command line can catch exactly those, with `except MoneyError`, and let a real bug through.

The example prints `Refused: An amount can't be 0.`

The usual slip is to raise `ValueError` for everything. Then `except ValueError` also catches mistakes in your own code, and hides them.
