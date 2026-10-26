---
id: predict-keywords
type: predict
title: By name
concept: keyword-arguments
code: |
  def describe(length=12, digits=True, symbols=False):
      return f"{length} characters, digits {digits}, symbols {symbols}"

  print(describe(symbols=True))
  print(describe(8, False))
question: What does this print?
options:
  - text: |-
      12 characters, digits True, symbols True
      8 characters, digits False, symbols False
    correct: true
    feedback: "Right. `symbols=True` goes to `symbols`, wherever it sits, and the others keep their defaults. `8` and `False` have no names, so they fill the parameters from the left."
  - text: |-
      True characters, digits True, symbols False
      8 characters, digits False, symbols False
    misconception: keyword-fills-next-slot
    feedback: "A named argument goes to the parameter with that name, not to the first one in the list. `length` keeps its default of 12."
  - text: An error, because the first call skips length and digits
    misconception: cannot-skip-defaults
    error: TypeError
    feedback: "Naming an argument lets you skip the parameters before it, as long as they have defaults."
  - text: |-
      12 characters, digits True, symbols True
      8 characters, digits True, symbols False
    misconception: positional-skips-defaults
    feedback: "Unnamed arguments fill the parameters in order, defaults or not: `8` goes to `length` and `False` to `digits`."
---
A call can name its arguments: `symbols=True`. These are **keyword arguments**. They can come in any order, and they let you skip the defaults you're happy with.

Unnamed arguments are **positional**: they fill the parameters from the left.
