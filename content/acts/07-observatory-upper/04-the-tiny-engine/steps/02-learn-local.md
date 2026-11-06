---
id: learn-local
type: learn
title: Each card passes blame back
concept: autograd
code: |
  class Value:
      def __init__(self, data, parents=()):
          self.data = data
          self.grad = 0.0
          self.parents = parents
          self._backward = lambda: None

      def __mul__(self, other):
          out = Value(self.data * other.data, (self, other))

          def _backward():
              self.grad += other.data * out.grad     # each side's slope is the other side
              other.grad += self.data * out.grad

          out._backward = _backward
          return out


  width = Value(3.0)
  length = Value(4.0)
  area = width * length

  area.grad = 1.0          # blame starts at the answer
  area._backward()         # and passes back to what made it
  print(width.grad, length.grad)
---
Each operation also leaves behind a small function, `_backward`, that knows its own slope. Called later, it passes the blame arriving at the answer, `out.grad`, back to each parent, exactly as on Neil's blackboard: in a product, each side's slope is the other side.

`_backward` is a closure, from Act II: a function made inside `__mul__` that remembers `self`, `other` and `out` after `__mul__` has finished.

The example starts the blame at the answer, `area.grad = 1.0`, and calls `area._backward()`. Nudge the width and the area moves 4 times as much, so `width.grad` is `4.0`; `length.grad` is `3.0`.

The blame is added with `+=`, never `=`. The usual mistake is writing over it, which loses a share when one value is used twice.
