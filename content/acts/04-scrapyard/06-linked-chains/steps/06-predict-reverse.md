---
id: predict-reverse
type: predict
title: One turn
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


  axle = Crate("axle")
  axle.next = Crate("brakes")
  axle.next.next = Crate("chassis")

  before = None
  crate = axle
  after = crate.next
  crate.next = before
  before = crate
  crate = after
  show(before)
  show(crate)
question: What does this print?
options:
  - text: |-
      ['axle']
      ['brakes', 'chassis']
    correct: true
    feedback: "Right. One pass turned the axle's arrow round to `None`, so the reversed part is just the axle. `crate` has stepped on to the brakes, and the rest of the round is still linked from there."
  - text: |-
      ['axle', 'brakes', 'chassis']
      ['brakes', 'chassis']
    misconception: relinking-keeps-the-rest
    feedback: "`crate.next = before` replaced the axle's arrow. It points at `None` now, so a walk from the axle stops straight away."
  - text: |-
      ['chassis', 'brakes', 'axle']
      []
    misconception: one-pass-reverses
    feedback: "This is one pass of the loop, without the `while`. It turns one arrow, the axle's. The other two turn on the next two passes."
---
One pass of the reversing loop, written out without the `while`.
