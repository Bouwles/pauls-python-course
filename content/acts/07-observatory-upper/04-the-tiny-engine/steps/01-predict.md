---
id: predict
type: predict
title: One card, used twice
concept: autograd
dialogue:
  - neil.neutral.point: "First card. A square tabletop, three feet a side. The area is the side times itself."
  - neil.thinking: "So the side is on the back of the card twice. Is that allowed? It is."
code: |
  class Value:
      """A number that remembers what it was made from."""

      def __init__(self, data, parents=()):
          self.data = data
          self.grad = 0.0
          self.parents = parents
          self._backward = lambda: None

      def __mul__(self, other):
          out = Value(self.data * other.data, (self, other))

          def _backward():
              self.grad += other.data * out.grad
              other.grad += self.data * out.grad

          out._backward = _backward
          return out


  side = Value(3.0)
  area = side * side

  area.grad = 1.0       # blame starts at the answer
  area._backward()      # and passes back to whatever made it
  print(side.grad)
question: What does this print?
options:
  - text: "6.0"
    correct: true
    feedback: "Right. `self` and `other` are both `side`, so the closure adds to `side.grad` twice: 3, then 3 more. The slope of a side squared is twice the side. That `+=` is the whole reason a value used twice gets the right gradient."
  - text: "3.0"
    misconception: grad-counted-once-when-reused
    feedback: "That's one of the two uses. `side` is both `self` and `other`, so the closure adds to its grad twice, 3 each time. Had it said `=`, the second line would have written over the first, and you'd get 3."
  - text: "9.0"
    misconception: grad-holds-result
    feedback: "9.0 is the area, in `area.data`. `.grad` holds something else: how fast the area changes when the side is nudged, which is 6."
after: |
  Run it. Then change both `+=` to `=` and run it again.
---
`Value` keeps a number in `.data` and, in `.parents`, the values it was made from. `a * b` calls `a.__mul__(b)`, which makes the new value and notes `(self, other)` as its parents.

It also leaves behind `_backward`, a closure: a small function that remembers `self`, `other` and `out`. Called later, it passes the blame arriving at `out` back to the two parents, using the same rule as the blackboard: in a product, each side's slope is the other side.
