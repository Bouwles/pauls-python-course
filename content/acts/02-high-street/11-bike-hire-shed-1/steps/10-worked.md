---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "The clock's spare parts again. Each drawer should keep its own count, and refuse to go below zero."
code: |
  class Drawer:
      """One drawer of the clock's spare parts."""

      def __init__(self, part, number):
          self.part = part
          self.number = number
          self.count = 0
          self.history = []

      def add(self, how_many):
          if how_many <= 0:
              raise ValueError("Add at least one.")
          self.count += how_many
          self.history.append(how_many)

      def take(self, how_many):
          if how_many <= 0:
              raise ValueError("Take at least one.")
          if how_many > self.count:
              return False
          self.count -= how_many
          self.history.append(-how_many)
          return True

      def __str__(self):
          return f"Drawer {self.number}, {self.part}: {self.count} left"


  screws = Drawer("brass screw", 7)
  screws.add(140)
  screws.take(12)
  print(screws)
  print(screws.take(500))
  print(screws.history)
subgoals:
  - label: Name the class for one thing
    lines: [1, 2]
  - label: Give each new one its starting attributes
    lines: [4, 8]
  - label: Say no before you change anything
    lines: [10, 12]
  - label: Then change the object
    lines: [13, 14]
  - label: Say no before you change anything
    lines: [16, 20]
  - label: Then change the object
    lines: [21, 23]
  - label: "Methods that answer a question about it: __str__"
    lines: [25, 26]
  - label: Make objects and call methods on them
    lines: [29, 34]
explain:
  prompt: "Why does `take` check the count before line 21, instead of taking the parts away and checking afterwards?"
  answer: "If it took them first, a refused request would already have changed the count and the history. Saying no first means a refusal changes nothing."
  concept: methods
---
Paul's drawer is built like Caitlin's account. It keeps its own count in whole numbers, and a history of every change, in the order they happened.

Each method that changes the drawer says no first: a `ValueError` for a request that makes no sense, and `False` for one it can't do. Only then does it change anything. `-=` takes away, as `+=` adds.

The labels beside the code are the steps he took. They're the comments in your file.
