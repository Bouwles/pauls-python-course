---
id: learn-relink
type: learn
title: Changing two arrows
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

  tank = Crate("fuel-tank")
  tank.next = axle.next
  axle.next = tank
  show(axle)

  tank.next = tank.next.next
  show(axle)
---
To put a crate into the middle of a linked list, nothing moves. You change two arrows: the new crate points at the crate that comes after it, then the crate before points at the new crate.

Do them in that order. Changing an arrow forgets where it pointed, so if the crate before changes first, the rest of the round is lost.

Taking a crate off is one arrow: point the crate before it past it, at the crate after. The crate is still there, but no arrow reaches it.

The example puts a fuel tank after the axle, then takes the brakes off. It prints `['axle', 'fuel-tank', 'brakes']`, then `['axle', 'fuel-tank']`.

Once you're standing on the crate before, either change is O(1), however long the round.
