---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Penhallow's engine, but faster. I took the visited set out. Nobody visits a value twice anyway."
  - pip: "The engine says -3. Measuring says -2. Measuring must be broken. It was last time."
dialogue_after:
  - pip: "So `=` throws the first share away. And a value does get visited twice, if two things are made from it."
  - pip: "I've put the set back. It isn't even slower."
hints:
  nudge: "In `a * b + a`, `a` gets blame from two places. What happens to the first share when the second arrives with `=`?"
  plan:
    - Compare the engine's slopes with the measured ones
    - Add each share of blame to a parent's grad instead of writing over it
    - Run again, then try a middle value used twice, such as c * c with c = a * b
    - Visit each value once, keeping a set of the ones already visited
  shape: |
    def _backward():
        self.grad ___ other.data * out.grad
        other.grad ___ self.data * out.grad

    ...

    def visit(value):
        if value in ___:
            return
        seen.___(value)
        for parent in value.parents:
            visit(parent)
        order.append(value)
---
Wendt's check is `a * b + a` at `a = 2`, `b = -3`. On paper, the slope for `a` is `b + 1`, which is -2, and for `b` it's `a`, which is 2. Pip's engine works it out; his `__main__` measures it by nudging.

Run it, compare the two lines, and fix the engine until they agree.

Then try `c = a * b` and `(c * c).backward()` at `a = 2`, `b = 0.5`. The slope for `a` should be 1. There's a second bug, and Wendt's check doesn't show it.
