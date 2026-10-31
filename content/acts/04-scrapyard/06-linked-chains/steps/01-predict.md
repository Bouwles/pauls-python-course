---
id: predict
type: predict
title: Follow the chalk
concept: linked-lists
dialogue:
  - yahya: "Never mind which crate came in first. Follow the arrows."
code: |
  class Crate:
      def __init__(self, part):
          self.part = part
          self.next = None


  anchor = Crate("anchor")
  bell = Crate("bell")
  chain = Crate("chain")
  anchor.next = chain
  chain.next = bell

  crate = anchor
  while crate is not None:
      print(crate.part)
      crate = crate.next
question: What does this print?
options:
  - text: |-
      anchor
      chain
      bell
    correct: true
    feedback: "Right. The order is in the links, not in the order the crates were made. The anchor points at the chain, and the chain at the bell."
  - text: |-
      anchor
      bell
      chain
    misconception: chain-order-is-creation-order
    feedback: "Making the crates in that order doesn't link them. The walk only follows `next`, and the anchor's `next` is the chain."
  - text: anchor, chain, bell, then an AttributeError
    misconception: walk-falls-off-end
    error: AttributeError
    feedback: "After the bell, `crate` becomes `None`, and the `while` checks that before reading `crate.part`. The loop stops cleanly at the end."
after: |
  Run it. Then press Step through and look at the objects: each crate's `next` is an arrow to another crate, or `None`.
---
The clockmaker's chalked round is a **linked list**. Each crate holds its part and a reference to the next crate; the last crate's `next` is `None`. To find anything, you start at the first crate and follow the arrows.
