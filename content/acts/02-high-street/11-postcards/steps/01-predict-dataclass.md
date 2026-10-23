---
id: predict-dataclass
type: predict
title: A class that writes itself
concept: dataclasses
code: |
  from dataclasses import dataclass


  @dataclass
  class Postcard:
      sender: str
      to: str


  first = Postcard("Bea", "Truro")
  second = Postcard("Bea", "Truro")
  print(first)
  print(first == second)
question: What does this print?
options:
  - text: |-
      Postcard(sender='Bea', to='Truro')
      True
    correct: true
    feedback: "Right. `@dataclass` wrote `__init__`, `__repr__` and `__eq__` from the fields. Two postcards with the same fields are equal."
  - text: |-
      Postcard(sender='Bea', to='Truro')
      False
    misconception: dataclass-eq-is-identity
    feedback: "A dataclass writes `__eq__` for you: two postcards are equal when every field matches. Without it, `==` would only be True for the same object."
  - text: An error, because Postcard has no __init__
    misconception: dataclass-needs-init
    error: TypeError
    feedback: "`@dataclass` reads the fields and writes `__init__` for you. That's the point of it."
---
Last job you wrote `__init__`, `__repr__` and `__eq__` by hand. A **dataclass** writes them for you: list the fields with their types, and `@dataclass` above the class does the rest.

The `@` line is a decorator. The Shop Timer job explains how they work; for now, it's an instruction to Python about the class below it.
