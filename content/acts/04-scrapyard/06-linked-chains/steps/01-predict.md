---
id: predict
type: predict
title: Follow the chalk
concept: linked-lists
dialogue:
  - neil.thinking.point: "Never mind which crate came in first. Follow the arrows."
code: |
  class Crate:
      def __init__(self, part):
          self.part = part
          self.next = None


  axle = Crate("axle")
  brakes = Crate("brakes")
  chassis = Crate("chassis")
  axle.next = chassis
  chassis.next = brakes

  crate = axle
  while crate is not None:
      print(crate.part)
      crate = crate.next
question: What does this print?
options:
  - text: |-
      axle
      chassis
      brakes
    correct: true
    feedback: "Right. The order is in the links, not in the order the crates were made. The axle points at the chassis, and the chassis at the brakes."
  - text: |-
      axle
      brakes
      chassis
    misconception: chain-order-is-creation-order
    feedback: "Making the crates in that order doesn't link them. The walk only follows `next`, and the axle's `next` is the chassis."
  - text: axle, chassis, brakes, then an AttributeError
    misconception: walk-falls-off-end
    error: AttributeError
    feedback: "After the brakes, `crate` becomes `None`, and the `while` checks that before reading `crate.part`. The loop stops cleanly at the end."
after: |
  Run it. Then press Step through and look at the objects: each crate's `next` is an arrow to another crate, or `None`.
---
The kart track's chalked round of crates is a **linked list**. Each crate holds its part and a reference to the next crate; the last crate's `next` is `None`. To find anything, you start at the first crate and follow the arrows.
