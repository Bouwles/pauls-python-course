---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "Yahya's way, done properly, on a bike hire. A cargo bike really is a kind of bike."
code: |
  class Bike:
      def __init__(self, number, rate):
          self.number = number
          self.rate = rate
          self.rider = None

      def give_back(self, hours):
          self.rider = None
          return hours * self.rate


  class CargoBike(Bike):
      """A bike with a box on the front, hired for deliveries."""

      def __init__(self, number, rate, box_litres):
          super().__init__(number, rate)
          self.box_litres = box_litres

      def give_back(self, hours):
          cost = super().give_back(hours)
          return cost + 1.50


  cargo = CargoBike(15, 5, 80)
  print(cargo.rider, cargo.box_litres)
  print(cargo.give_back(2))
subgoals:
  - label: Say what kind of thing it is
    lines: [12, 13]
  - label: Let the parent set up its part
    lines: [15, 16]
  - label: Add what is new
    lines: [17, 17]
  - label: Change only what differs, reusing the parent's work
    lines: [19, 21]
  - label: Use it like any other bike
    lines: [24, 26]
explain:
  prompt: "What would `cargo.rider` be if line 16 were deleted?"
  answer: "There'd be no `rider` at all: an AttributeError. Writing `__init__` in the subclass replaces the parent's, so the parent's setup only runs if you call it with `super().__init__`."
  concept: super
---
Yahya's way, where it's right: a cargo bike really is a kind of bike. It inherits from `Bike`, lets `Bike` set up its part with `super().__init__`, and adds only its box.

`give_back` reuses the parent's work with `super().give_back(hours)`, then adds the box fee on top. The labels beside the code are the steps he took. Neil's reference book takes the last two.
