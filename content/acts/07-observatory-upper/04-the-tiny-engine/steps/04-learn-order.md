---
id: learn-order
type: learn
title: Who passes the blame first
concept: autograd
code: |
  # loss = a * b + a, written as what each value was made from
  made_from = {"loss": ["ab", "a"], "ab": ["a", "b"], "a": [], "b": []}

  order = []
  seen = set()


  def visit(name):
      if name in seen:
          return
      seen.add(name)
      for parent in made_from[name]:
          visit(parent)
      order.append(name)


  visit("loss")
  print(order)
  print(list(reversed(order)))
---
One call to `backward()` on the answer should fill in every gradient. It has to call each value's `_backward` in the right order: a value may only pass its blame back once all its blame has arrived.

In `loss = a * b + a`, the value `a` gets blame twice: straight from `loss`, and through `ab`. So `a` must wait until both have passed theirs.

The fix is an order with every value after its parents, called a **topological order**. `visit` finishes a value's parents before writing the value down, a recursion from Act IV. `seen` stops it writing a value twice. Walk that list backwards, from the answer, and every value's blame is complete before it passes it on.

The usual mistake is leaving out `seen`. A value on the list twice passes its blame back twice.
