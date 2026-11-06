---
id: learn-zero
type: learn
title: Start each step from zero
concept: autograd
code: |
  class Value:
      def __init__(self, data, parents=()):
          self.data = data
          self.grad = 0.0
          self.parents = parents
          self._backward = lambda: None

      def __add__(self, other):
          out = Value(self.data + other.data, (self, other))

          def _backward():
              self.grad += out.grad
              other.grad += out.grad

          out._backward = _backward
          return out


  weight, bias = Value(2.0), Value(1.0)
  for step in range(3):
      total = weight + bias
      total.grad = 1.0
      total._backward()
      print("without zeroing:", weight.grad)

  for step in range(3):
      weight.grad = 0.0
      total = weight + bias
      total.grad = 1.0
      total._backward()
      print("zeroed first:", weight.grad)
---
Training calls `backward()` once a step, on a fresh loss, with the same weights each time. And blame is added with `+=`.

So last step's gradients are still sitting in `.grad` when this step's arrive, and they pile up. In the example, the weight's slope is 1 every time, but without zeroing its `.grad` reads `1.0`, `2.0`, then `3.0`. Every step would walk further than the last, in a direction that's partly out of date.

The fix is one line at the top of each step: set every weight's `.grad` back to 0, then work out the loss and call `backward()`. Then each step's gradient is that step's alone.

The usual mistake is thinking `backward()` starts afresh. It only adds.
