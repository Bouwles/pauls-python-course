---
id: predict-dataclass
type: predict
title: A class that writes itself
concept: dataclasses
dialogue:
  - neil: "Two cards for the same book. Two. On my shelves."
code: |
  from dataclasses import dataclass


  @dataclass
  class Card:
      title: str
      author: str


  first = Card("Emma", "Jane Austen")
  second = Card("Emma", "Jane Austen")
  print(first)
  print(first == second)
question: What does this print?
options:
  - text: |-
      Card(title='Emma', author='Jane Austen')
      True
    correct: true
    feedback: "Right. `@dataclass` wrote `__init__`, `__repr__` and `__eq__` from the fields. Two cards with the same fields are equal, which is how Neil finds a duplicate."
  - text: |-
      Card(title='Emma', author='Jane Austen')
      False
    misconception: dataclass-eq-is-identity
    feedback: "A dataclass writes `__eq__` for you: two cards are equal when every field matches. Without it, `==` would only be True for the same object."
  - text: An error, because Card has no __init__
    misconception: dataclass-needs-init
    error: TypeError
    feedback: "`@dataclass` reads the fields and writes `__init__` for you. That's the point of it."
---
For Riya's trip fund you wrote `__init__` and `__str__` by hand. A **dataclass** writes the usual methods for you: list the fields with their types, and `@dataclass` above the class does the rest.

The `@` line is a decorator. A later project shows how they work; for now, it's an instruction to Python about the class below it.
