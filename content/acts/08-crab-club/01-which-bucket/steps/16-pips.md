---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.neutral: "Can you look at mine? Something's off. I work out the best screen first, every visitor. Saves a step."
  - yahya.confused: "It explores one visitor in ten. Then says it showed the high-score table a thousand times."
dialogue_after:
  - yahya.surprised: "So the other screens brought people in, and the high-score table got the credit. Fast and wrong."
hints:
  nudge: "When an exploring visitor is shown the demo race, whose estimate should their answer change?"
  plan:
    - Run it and read which screens were shown
    - Follow one exploring visitor through the loop by hand
    - Give the count and the reward to the screen the visitor was actually shown
  shape: |
    reward = 1 if rng.random() < rates[version] else 0
    counts[___] += 1
    estimates[___] += (reward - estimates[___]) / counts[___]
---
Yahya's `run_test` is epsilon-greedy, with one visitor in ten exploring. Run it and look at the counts: one screen was given every visitor, though one in ten saw something else.

Fixed, every screen is shown at least a few times in 1000 visitors, the counts add up to the visitors, and most visitors end up seeing the best screen. Follow one exploring visitor through the loop to find where their result goes.
