---
id: pips
type: pips
title: Pip's Version
files: [bright.py]
entry: bright.py
dialogue:
  - pip: "Twenty-four bright stars, four groups. Seed 2, lovely. Seed 1, lovely."
  - pip: "Seed 11, every star in one group and three groups of nobody. I've changed nothing."
dialogue_after:
  - pip: "It picked the same star twice. Two centres on one star, and one of them gets nobody."
  - pip: "The middle of nobody is nan. Then nan ate everything."
hints:
  nudge: "Print `centres` straight after they're picked, with seed 11. How many different stars are there?"
  plan:
    - Find the step where the first nan appears
    - Find which group had no stars at that step
    - Find why it had none
    - Make the starting centres K different stars
  shape: |
    centres = stars[rng.choice(len(stars), size=K, ___)]
---
Pip's k-means sorts the twenty-four brightest stars on the plate into `K` groups, starting from `K` stars picked at random. Run it with seed 11, and read the warning under the output too.

Find where it goes wrong, and fix it so the starting centres are a fair start. The checks try other seeds and other numbers of groups.
