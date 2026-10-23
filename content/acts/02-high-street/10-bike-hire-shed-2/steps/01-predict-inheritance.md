---
id: predict-inheritance
type: predict
title: A kind of bike
concept: inheritance
dialogue:
  - dev: "A tricycle is a bike with an extra wheel. Watch."
code: |
  class Bike:
      def __init__(self, number):
          self.number = number

      def describe(self):
          return f"Bike {self.number}, {self.wheels()} wheels"

      def wheels(self):
          return 2


  class Tricycle(Bike):
      def wheels(self):
          return 3


  trike = Tricycle(4)
  print(trike.describe())
question: What does this print?
options:
  - text: Bike 4, 3 wheels
    correct: true
    feedback: "Right. `Tricycle` gets `__init__` and `describe` from `Bike`. Inside `describe`, `self` is the tricycle, so `self.wheels()` finds the tricycle's own version."
  - text: Bike 4, 2 wheels
    misconception: parent-methods-call-parent-versions
    feedback: "`describe` is written in `Bike`, but `self` is still the tricycle. Python looks for `wheels` on the tricycle first."
  - text: An error, because Tricycle has no __init__ or describe
    misconception: child-class-starts-empty
    error: AttributeError
    feedback: "The class in brackets is the parent. `Tricycle` gets every method `Bike` has, `__init__` included, unless it writes its own."
---
`class Tricycle(Bike):` makes a **subclass**: a tricycle is a kind of bike. It **inherits** everything `Bike` has and replaces only the methods it writes itself. Replacing one is called **overriding** it.
