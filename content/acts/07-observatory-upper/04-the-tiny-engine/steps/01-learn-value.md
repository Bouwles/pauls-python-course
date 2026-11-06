---
id: learn-value
type: learn
title: Numbers with receipts
concept: autograd
dialogue:
  - neil.neutral.point: "Picture a shoebox of index cards. One number on each, and on the back, the cards it was made from."
code: |
  class Value:
      """A number that remembers what it was made from."""

      def __init__(self, data, parents=()):
          self.data = data
          self.grad = 0.0
          self.parents = parents

      def __mul__(self, other):
          return Value(self.data * other.data, (self, other))


  width = Value(3.0)
  length = Value(4.0)
  area = width * length
  print(area.data)
  print([parent.data for parent in area.parents])
  print(width.parents)
---
Writing a backward pass by hand for every network is slow and easy to get wrong. An **autograd engine** works the gradients out for you. The trick is numbers that remember how they were made.

`Value` holds a number in `.data`, its gradient in `.grad`, starting at 0, and the values it was made from in `.parents`. `width * length` calls `__mul__`, a dunder method from Act II, which makes a new `Value` and notes `(self, other)` as its parents.

So `area` knows it came from 3 and 4. A number you typed in, like `width`, has no parents: `()`. Follow the parents back from any answer and you reach every number that went into it.

The usual mistake is thinking `.grad` holds the answer. The answer is in `.data`; `.grad` will hold the slope.
