---
id: predict-dunder
type: predict
title: How a bike shows itself
concept: dunder-methods
code: |
  class Bike:
      def __init__(self, number, rate):
          self.number = number
          self.rate = rate

      def __str__(self):
          return f"Bike {self.number}"

      def __repr__(self):
          return f"Bike({self.number}, {self.rate})"


  shed = [Bike(7, 4), Bike(12, 5)]
  print(shed[0])
  print(shed)
question: What does this print?
options:
  - text: |-
      Bike 7
      [Bike(7, 4), Bike(12, 5)]
    correct: true
    feedback: "Right. `print` on one bike asks for `__str__`, the version for people. A list shows its items with `__repr__`, the version for programmers."
  - text: |-
      Bike 7
      [Bike 7, Bike 12]
    misconception: list-shows-str
    feedback: "A list always shows its items with `__repr__`, so you can see exactly what's in it. Only the bike printed on its own uses `__str__`."
  - text: |-
      Bike(7, 4)
      [Bike(7, 4), Bike(12, 5)]
    misconception: print-uses-repr
    feedback: "`print` asks for `__str__` first. It only falls back on `__repr__` when there's no `__str__`."
  - text: An error, because nothing calls __str__
    misconception: dunders-must-be-called
    error: TypeError
    feedback: "You never call `__str__` yourself. `print` calls it for you; Python calls all the double-underscore methods at the right moment."
---
Methods with double underscores, **dunder methods**, are ones Python calls for you. `__str__` is what `print` shows to people. `__repr__` is what you'd type to make the object, shown to programmers. `__eq__` decides what `==` means. `__len__` is what `len()` asks.
