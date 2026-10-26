---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My bench works the same way. Each repair knows about itself."
code: |
  class Repair:
      """One job on Moss's bench."""

      def __init__(self, item, owner, rate):
          self.item = item
          self.owner = owner
          self.rate = rate
          self.hours = 0
          self.done = False

      def work(self, hours):
          self.hours += hours

      def finish(self):
          self.done = True
          return self.hours * self.rate

      def describe(self):
          if self.done:
              return f"{self.item} for {self.owner}, done"
          return f"{self.item} for {self.owner}, on the bench"


  radio = Repair("radio", "Moss", 0)
  mixer = Repair("mixer", "Bea", 12)
  mixer.work(2)
  print(mixer.describe())
  print(mixer.finish())
  print(radio.describe())
subgoals:
  - label: Name the class for one thing
    lines: [1, 2]
  - label: Give each new one its starting attributes
    lines: [4, 9]
  - label: Methods that change the object
    lines: [11, 16]
  - label: Methods that answer a question about it
    lines: [18, 21]
  - label: Make objects and call methods on them
    lines: [24, 29]
explain:
  prompt: "Why does `work` say `self.hours += hours`, and not `hours += hours`?"
  answer: "`self.hours` is the repair's running total, kept on the object between calls. Plain `hours` is the parameter, which disappears when the method ends."
  concept: self
---
The class is named for one thing: a `Repair`, not `Repairs`. Every attribute a repair needs is set in `__init__`, even the ones that start at nothing, so no method has to wonder whether they exist.

The radio has been on the bench since before you arrived.
