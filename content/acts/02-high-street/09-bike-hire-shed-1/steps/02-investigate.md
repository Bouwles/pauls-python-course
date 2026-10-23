---
id: investigate
type: investigate
title: Methods and self
concept: methods
code: |
  class Bike:
      def __init__(self, number, rate):
          self.number = number
          self.rate = rate
          self.rider = None

      def hire(self, rider):
          self.rider = rider

      def cost(self, hours):
          return hours * self.rate


  red = Bike(7, 4)
  red.hire("Bea")
  print(red.rider)
  print(red.cost(3))
tasks:
  - id: self-is-red
    prompt: "`red.hire(\"Bea\")` passes one argument, but `hire` has two parameters. Add `print(self)` inside `hire`, and `print(red)` at the very bottom. Do they show the same object? Answer yes or no."
    kind: answer
    accept: ["yes", "y", "yes, the same", "same"]
    feedback: "Yes: the same address both times. `red.hire(\"Bea\")` runs `hire` with `self` set to `red`, the object before the dot."
    wrong: "Compare the numbers after `at` in the two lines."
  - id: second-bike
    prompt: "Add a second bike, `blue = Bike(12, 6)`. Hire it to `Gwen`, then print `blue.rider` and `blue.cost(5)`."
    kind: run
    tests: |
      TESTS = [
          output("Gwen has blue", expect=r"^Gwen$", match="regex",
                 hint="Call hire on blue, the object, not on Bike: blue.hire(\"Gwen\")."),
          output("Five hours on blue", expect=r"^30$", match="regex"),
      ]
    solution: |
      class Bike:
          def __init__(self, number, rate):
              self.number = number
              self.rate = rate
              self.rider = None

          def hire(self, rider):
              self.rider = rider

          def cost(self, hours):
              return hours * self.rate


      red = Bike(7, 4)
      red.hire("Bea")
      print(red.rider)
      print(red.cost(3))
      blue = Bike(12, 6)
      blue.hire("Gwen")
      print(blue.rider)
      print(blue.cost(5))
  - id: no-self
    prompt: "In `hire`, change `self.rider = rider` to `rider = rider` and run it. What does `print(red.rider)` show now?"
    kind: answer
    accept: ["None"]
    feedback: "None. Without `self.`, `rider = rider` only makes a local variable that vanishes when the method ends. The bike never heard about Bea."
---
A function inside a class is a **method**. Its first parameter, `self`, is the object the method was called on. Methods use `self.` to read and change that object's attributes.

Work through the questions. Reset the code whenever you like.
