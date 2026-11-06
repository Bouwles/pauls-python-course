---
id: predict-dataclass
type: predict
title: A class that writes itself
concept: dataclasses
dialogue:
  - neil.unimpressed: "Two cards for the same book. Two. On my shelves."
code: |
  from dataclasses import dataclass


  @dataclass
  class Card:
      title: str
      author: str


  first = Card("Carrying the Fire", "Michael Collins")
  second = Card("Carrying the Fire", "Michael Collins")
  print(first)
  print(first == second)
question: What does this print?
options:
  - text: |-
      Card(title='Carrying the Fire', author='Michael Collins')
      True
    correct: true
    feedback: "`@dataclass` wrote `__init__`, `__repr__` and `__eq__` from the fields. Two cards with the same fields are equal, which is how Neil finds a duplicate."
  - text: |-
      Card(title='Carrying the Fire', author='Michael Collins')
      False
    misconception: dataclass-eq-is-identity
    feedback: "A dataclass writes `__eq__` for you: two cards are equal when every field matches. Without it, `==` would only be True for the same object."
  - text: An error, because Card has no __init__
    misconception: dataclass-needs-init
    error: TypeError
    feedback: "`@dataclass` reads the fields and writes `__init__` for you. That's the point of it."
---
Two cards for one book, as Neil found them on his shelves.
