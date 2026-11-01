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
Yahya's test loop explores exactly as often as it should. Run it and look at the counts.

Find the bug, then fix it.
