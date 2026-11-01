---
id: make
type: make
title: The tiny engine
files: [engine.py]
entry: engine.py
on_pass: { aaesha.pleased: "Twenty-four and four. The same as the blackboard, and nobody did any calculus. The blame went where it belonged." }
hints:
  nudge: "In `__add__`, each parent's share is just `out.grad`. In a product, what is each side's slope?"
  plan:
    - Make the new value and note its parents
    - Say how blame passes back to each parent
    - "The same for **, exp and relu: one parent each, and each its own slope"
    - Put every value after its parents
    - Start at 1, and walk the list backwards
  shape: |
    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), "*")

        def _backward():
            self.grad += ___ * out.grad
            other.grad += ___ * out.grad

        out._backward = _backward
        return out

    # __pow__: power * self.data ** (power - 1)
    # exp: out.data
    # relu: 1 if self.data > 0, else 0

    def backward(self):
        order = []
        seen = set()

        def visit(value):
            if value in seen:
                return
            seen.add(value)
            for parent in ___:
                visit(parent)
            order.append(___)

        visit(self)
        self.grad = ___
        for value in reversed(___):
            value._backward()
---
Finish `Value` in `engine.py`. `__add__` is written out as the pattern; the comments are the subgoals from the tabletop and Paul's door. Each operation has its own slope:

```
a * b       each side's slope is the other side
a ** n      n * a ** (n - 1)
a.exp()     the exp itself
a.relu()    1 where a > 0, else 0
```

`-`, `/` and `sigmoid` are already written, built from these, so they need no slopes of their own.

```
Engine:   dL/dw1 = 24.0, dL/dw2 = 4.0
Measured: dL/dw1 = 24.0, dL/dw2 = 4.0
```

To see the graph, put `from drawing import draw_graph` at the top and `draw_graph(loss)` after `loss.backward()`, and press Run. The drawing shows every value, each with its gradient.

The checks compare your gradients with measured ones on formulas of every shape.
