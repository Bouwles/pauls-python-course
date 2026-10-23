---
id: predict-instances
type: predict
title: Two bikes from one pattern
concept: classes
code: |
  class Bike:
      def __init__(self, number, rate):
          self.number = number
          self.rate = rate


  red = Bike(7, 4)
  blue = Bike(12, 6)
  red.rate = 5
  print(red.rate, blue.rate)
question: What does this print?
options:
  - text: "5 6"
    correct: true
    feedback: "Right. Each `Bike(...)` makes a separate object with attributes of its own. Changing `red.rate` leaves `blue` alone."
  - text: "5 5"
    misconception: attributes-shared-between-objects
    feedback: "The class is the pattern. Each object made from it keeps its own attributes: `red` and `blue` are two bikes."
  - text: "4 6"
    misconception: attributes-fixed-by-init
    feedback: "`__init__` sets the starting values. After that, `red.rate = 5` changes `red`'s rate like any other assignment."
  - text: An error, because Bike(7, 4) passes two arguments and __init__ has three
    misconception: self-passed-by-caller
    error: TypeError
    feedback: "Python passes `self` for you: it's the new bike. You pass only `number` and `rate`."
---
A **class** is a pattern for making objects. `Bike(7, 4)` makes one bike, then runs `__init__` on it with `self` as the new bike. Each `self.something = ...` line sticks an **attribute** on that bike: a value it keeps.

Read it, then commit to an answer.
