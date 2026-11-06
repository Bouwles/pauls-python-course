---
id: predict-own-errors
type: predict
title: Refused, and carrying on
concept: exceptions
code: |
  class MoneyError(Exception):
      """A broken money rule."""


  def add(pence):
      if pence == 0:
          raise MoneyError("An amount can't be 0.")
      return pence


  for pence in [450, 0, -320]:
      try:
          print(add(pence))
      except MoneyError as refusal:
          print("Refused:", refusal)
question: What does this print?
options:
  - text: |-
      450
      Refused: An amount can't be 0.
      -320
    correct: true
    feedback: "Your own error is raised and caught like Python's. The `except` prints its message, and the loop carries on."
  - text: |-
      450
      then a MoneyError
    misconception: try-cannot-catch
    feedback: "`except MoneyError` names exactly the error that's raised, so it catches it, and the loop goes on to `-320`."
  - text: An error, because MoneyError isn't one of Python's errors
    misconception: own-error-not-real
    error: TypeError
    feedback: "`MoneyError` is a subclass of `Exception`, so Python treats it like any of its own errors: it can be raised and caught."
---
Three amounts for Caitlin's ledger. One breaks a rule.
