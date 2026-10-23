---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Epsilon-greedy. Explores one run in ten. I checked the 0.1 twice."
  - pip: "Then it says it tried sprats a thousand times and nothing else. Sprats."
dialogue_after:
  - pip: "So the whelks were winning, and the sprats were getting the credit."
hints:
  nudge: "When the crab explores and eats cheese, whose estimate should his run change?"
  plan:
    - Run it and read which buckets were tried
    - Follow one exploring run through the loop by hand
    - Give the count and the reward to the bucket he actually ate from
  shape: |
    reward = 1 if rng.random() < rates[bucket] else 0
    counts[___] += 1
    estimates[___] += (reward - estimates[___]) / counts[___]
---
Pip's practice loop explores exactly as often as it should. Run it and look at the counts.

Find the bug, then fix it.
