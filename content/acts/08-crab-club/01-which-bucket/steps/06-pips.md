---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya: "Can you look at mine? Something's off. I work out the best flyer first, every visitor. Saves a step."
  - yahya: "It explores one visitor in ten. Then says it handed out three goes for a pound a thousand times."
dialogue_after:
  - yahya: "So the other flyers brought people in, and three goes for a pound got the credit. Fast and wrong."
hints:
  nudge: "When an exploring visitor is handed the cuddly crab, whose estimate should their answer change?"
  plan:
    - Run it and read which flyers were handed out
    - Follow one exploring visitor through the loop by hand
    - Give the count and the reward to the flyer the visitor was actually handed
  shape: |
    reward = 1 if rng.random() < rates[version] else 0
    counts[___] += 1
    estimates[___] += (reward - estimates[___]) / counts[___]
---
Yahya's test loop explores exactly as often as it should. Run it and look at the counts.

Find the bug, then fix it.
