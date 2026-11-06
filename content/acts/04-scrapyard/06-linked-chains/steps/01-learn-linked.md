---
id: learn-linked
type: learn
title: Each crate knows the next
concept: linked-lists
dialogue:
  - neil.thinking.point: "Never mind which crate came in first. Follow the arrows."
code: |
  class Crate:
      def __init__(self, part):
          self.part = part
          self.next = None


  first = Crate("axle")
  first.next = Crate("brakes")

  crate = first
  while crate is not None:
      print(crate.part)
      crate = crate.next
---
A **linked list** keeps its items in small objects that point to each other, instead of in numbered slots. Picture the kart track's crates: each holds a part and has a chalk arrow to the next crate. The last crate's arrow points at nothing.

In Python each crate is an object with two attributes: `part`, what it holds, and `next`, a reference to the next crate, or `None` at the end. To go through the list, start at the first crate and follow `next` until it's `None`.

The example links two crates and walks them. It prints `axle`, then `brakes`.

Reaching the hundredth crate means walking past ninety-nine, so finding things is O(n). The usual slip is to think the order is the order the crates were made. Only the arrows count.
