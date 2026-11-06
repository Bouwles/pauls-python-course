---
id: predict-docstring
type: predict
title: Which string
concept: docstrings
code: |
  def ticket(prefix):
      code = prefix + "1234"
      """Return a raffle ticket code."""
      return code

  print(ticket.__doc__)
question: What does this print?
options:
  - text: Return a raffle ticket code.
    misconception: docstring-anywhere
    feedback: "Only a string on the very first line inside the `def` is a docstring. This one comes after a line of code, so `ticket` has no docstring."
  - text: None
    correct: true
    feedback: "The string on line 3 comes after a line of code, so Python doesn't keep it. Move it up to line 2 and it becomes the docstring."
  - text: An error
    misconception: docstring-is-thrown-away
    error: AttributeError
    feedback: "Every function has a `__doc__`, docstring or not. When there isn't one, it holds `None`."
---
A ticket maker for Caitlin's games night. Look at where the string is.
