---
id: predict-keywords
type: predict
title: By name
concept: keyword-arguments
code: |
  def tag(item, owner="Moss", fragile=False):
      return f"{item} for {owner}, fragile: {fragile}"

  print(tag("clock", fragile=True))
  print(tag("mixer", "Bea"))
question: What does this print?
options:
  - text: |-
      clock for Moss, fragile: True
      mixer for Bea, fragile: False
    correct: true
    feedback: "Right. `fragile=True` goes to `fragile`, wherever it sits in the list, and `owner` keeps its default. `\"Bea\"` has no name, so it fills the next parameter in order."
  - text: |-
      clock for True, fragile: False
      mixer for Bea, fragile: False
    misconception: keyword-fills-next-slot
    feedback: "A named argument goes to the parameter with that name, not to the next one in the list. `owner` keeps its default."
  - text: An error, because owner is skipped
    misconception: cannot-skip-defaults
    error: TypeError
    feedback: "Naming an argument lets you skip the parameters before it, as long as they have defaults."
  - text: |-
      clock for Moss, fragile: True
      mixer for Moss, fragile: Bea
    misconception: positional-skips-defaults
    feedback: "Unnamed arguments fill the parameters in order, defaults or not: `\"mixer\"` goes to `item`, `\"Bea\"` to `owner`."
---
A call can name its arguments: `fragile=True`. These are **keyword arguments**. They can come in any order, and they let you skip the defaults you're happy with.

Unnamed arguments are **positional**: they fill the parameters from the left.
