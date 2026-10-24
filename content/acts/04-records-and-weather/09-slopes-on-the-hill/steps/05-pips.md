---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Measured the path at the stile. A step either side, like Moss said. One in two."
  - pip: "Nobody's carrying a thermometer screen up one in two. We'll need a winch."
dialogue_after:
  - pip: "One in four. Still steep. But not winch steep."
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

Pip has measured the steepest part of the hill path, at the stile, 650 metres from the station. Old Tom has walked it for sixty years and calls it "a bit of a pull".

Run it, and fix `slope`.
