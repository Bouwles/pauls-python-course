---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Epsilon-greedy. Explores one visitor in ten. I checked the 0.1 twice."
  - pip: "Then it says it handed out three goes for a pound a thousand times and nothing else."
dialogue_after:
  - pip: "So the other handbills were bringing people in, and three goes for a pound got the credit."
hints:
  nudge: "When an exploring visitor is handed the cuddly crab, whose estimate should their answer change?"
  plan:
    - Run it and read which handbills were handed out
    - Follow one exploring visitor through the loop by hand
    - Give the count and the reward to the handbill the visitor was actually handed
  shape: |
    reward = 1 if rng.random() < rates[version] else 0
    counts[___] += 1
    estimates[___] += (reward - estimates[___]) / counts[___]
---
Pip's test loop explores exactly as often as it should. Run it and look at the counts.

Find the bug, then fix it.
