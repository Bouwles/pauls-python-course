---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased.wave: "Can you look at mine? A step either side, like Paul said. Tested at the top: slope 0. Perfect."
  - riya.confused: "Then at the stile it says one in two. Nobody's carrying a thermometer screen up one in two."
dialogue_after:
  - riya.surprised: "One in four. At the top, 0 divided by anything is 0. My one test couldn't fail."
hints:
  nudge: "Nudging up by `step` and down by `step`: how far apart are the two points?"
  plan:
    - Run it and notice the answer is twice what it should be
    - Work out the run between the two nudged points
    - Divide by that run
  shape: |
    def slope(f, x, step=1e-5):
        return (f(x + step) - f(x - step)) / ___
---
A **numerical gradient** measures a slope instead of working it out: nudge the input a small step up and a small step down, and divide the change in the output by the distance between the two. Nudging both ways is far more accurate than nudging one way, because the curve's bend cancels out.

Riya has measured the steepest part of the hill path, at the stile, 650 metres from the park gate. Paul walks it most mornings and calls it "a bit of a pull".

Run it, and fix `slope`.
