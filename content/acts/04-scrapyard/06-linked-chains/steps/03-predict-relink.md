---
id: predict-relink
type: predict
title: A gong after the anchor
concept: linked-lists
code: |
  class Crate:
      def __init__(self, part):
          self.part = part
          self.next = None


  def show(crate):
      parts = []
      while crate is not None:
          parts.append(crate.part)
          crate = crate.next
      print(parts)


  anchor = Crate("anchor")
  anchor.next = Crate("bell")
  anchor.next.next = Crate("chain")

  gong = Crate("gong")
  anchor.next = gong
  show(anchor)
question: "Pip wants the gong between the anchor and the bell. What does this print?"
options:
  - text: "['anchor', 'gong']"
    correct: true
    feedback: "Right. The anchor's only arrow now points at the gong, and the gong points at nothing. The bell and the chain are still there, but no crate on the round points at them any more."
  - text: "['anchor', 'gong', 'bell', 'chain']"
    misconception: relinking-keeps-the-rest
    feedback: "Nothing told the gong where to go next. Its `next` is still `None`, so the walk stops there. Give `gong.next` the bell first, then point the anchor at the gong."
  - text: "['anchor', 'gong', 'chain']"
    misconception: next-assign-replaces-item
    feedback: "This isn't a list, where one position is swapped. The anchor points at the gong now, and the gong's `next` is `None`, so the chain is lost along with the bell."
after: |
  Run it. Then add `gong.next = anchor.next` on the line before `anchor.next = gong`, and run it again.
---
Putting a crate into the middle of a round takes two arrows: the new crate has to point at the rest of the round, and the crate before it has to point at the new crate.

The order matters, because changing an arrow forgets where it used to point.
