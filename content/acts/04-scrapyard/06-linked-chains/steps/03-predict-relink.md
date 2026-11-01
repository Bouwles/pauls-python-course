---
id: predict-relink
type: predict
title: A fuel tank after the axle
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

  tank = Crate("fuel-tank")
  axle.next = tank
  show(axle)
question: "Neil wants the fuel tank between the axle and the brakes. What does this print?"
options:
  - text: "['axle', 'fuel-tank']"
    correct: true
    feedback: "Right. The axle's only arrow now points at the fuel tank, and the tank points at nothing. The brakes and the chassis are still there, but no crate on the round points at them any more."
  - text: "['axle', 'fuel-tank', 'brakes', 'chassis']"
    misconception: relinking-keeps-the-rest
    feedback: "Nothing told the tank where to go next. Its `next` is still `None`, so the walk stops there. Give `tank.next` the brakes first, then point the axle at the tank."
  - text: "['axle', 'fuel-tank', 'chassis']"
    misconception: next-assign-replaces-item
    feedback: "This isn't a list, where one position is swapped. The axle points at the tank now, and the tank's `next` is `None`, so the chassis is lost along with the brakes."
after: |
  Run it. Then add `tank.next = axle.next` on the line before `axle.next = tank`, and run it again.
---
Putting a crate into the middle of a round takes two arrows: the new crate has to point at the rest of the round, and the crate before it has to point at the new crate.

The order matters, because changing an arrow forgets where it used to point.
