---
id: predict-twice
type: predict
title: Backward, twice
concept: autograd
dialogue:
  - pip: "I called backward twice, to be sure. Belt and braces."
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
              self.grad += other.data * out.grad
              other.grad += self.data * out.grad

          out._backward = _backward
          return out

      def backward(self):
          self.grad = 1.0
          self._backward()     # one step deep is all this example needs


  weight = Value(0.5)
  cloud = Value(0.8)
  total = weight * cloud

  total.backward()
  total.backward()
  print(weight.grad)
question: What does this print?
options:
  - text: "1.6"
    correct: true
    feedback: "Right. Each backward adds its share to `weight.grad`: 0.8, then 0.8 more. The engine has no idea the second call is a repeat. In a training loop that runs backward every step, last step's gradients are still sitting there unless you set them back to 0 first."
  - text: "0.8"
    misconception: backward-replaces-grads
    feedback: "backward doesn't start the gradients afresh. Every `_backward` adds with `+=`, so the second call piles 0.8 on top of the first 0.8."
  - text: "0.4"
    misconception: grad-holds-result
    feedback: "0.4 is `total.data`, the weight times the cloud. `weight.grad` is the slope: how fast the total moves when the weight is nudged, which is the cloud, 0.8, for each call."
after: |
  Run it. Then put `weight.grad = 0.0` between the two calls.
---
The `+=` that made `side * side` come out right has a cost. Training calls backward once per step, on a fresh loss each time, with the same weights.
