---
id: investigate
type: investigate
title: Steadier estimates
concept: policy-gradients
dialogue:
  - yahya.proud: "A baseline of minus seven? Make it minus fifty. Bigger numbers, bigger steps, faster learning."
code: |
  import numpy as np

  # The start, before any training: all four moves equally likely.
  CHANCES = np.full(4, 0.25)
  # What a race tends to be worth after each first move. Nobody tells the crab.
  WORTH = np.array([-3.0, -9.0, -9.0, -8.0])       # up, down, left, right
  BASELINE = -7.0


  def estimates(baseline, races, rng):
      """One REINFORCE estimate per race, for the start's four preferences."""
      found = []
      for _ in range(races):
          action = rng.choice(4, p=CHANCES)
          ret = WORTH[action] + rng.normal(0, 3)      # no two races alike
          found.append((ret - baseline) * (np.eye(4)[action] - CHANCES))
      return np.array(found)


  rng = np.random.default_rng(8)
  for name, baseline in [("No baseline", 0.0), (f"Baseline {BASELINE}", BASELINE)]:
      found = estimates(baseline, 2000, rng)
      print(f"{name}: average {found.mean(axis=0).round(1)}, spread {found.std(axis=0).mean():.1f}")
tasks:
  - id: steadier
    prompt: "Run it. Which estimates disagree with each other less: no baseline, or a baseline of -7?"
    kind: answer
    accept: ["baseline", "the baseline", "with the baseline", "with a baseline", "baseline -7", "baseline -7.0", "-7", "-7.0", "the second", "a baseline of -7"]
    feedback: "The baseline: a spread of 1.5 against 3.5. Races from the start are worth about -7, so return minus -7 is small, and so is each estimate. Both averages point the same way: up more likely, the rest less."
    wrong: "Compare the two spread numbers."
  - id: pips-baseline
    prompt: "Do as Yahya says: set `BASELINE = -50.0` and run it. Does the average of 2000 estimates still say up is the move to make more likely?"
    kind: answer
    accept: ["no", "no it doesn't", "no, it doesn't", "it doesn't", "not any more", "no longer"]
    feedback: "No. Over endless races it would, since a baseline never changes the long-run average. But every return minus -50 is about +43, so each estimate is huge and points wherever this race happened to go: a spread of 18.5. Two thousand races aren't enough to see uphill. A baseline helps when it's close to what races from there are usually worth."
    wrong: "Look at the first number of the average, the one for up, with BASELINE at -50."
---
Two thousand REINFORCE estimates for the start's four preferences, from a rough model of the grid. Each is one race's return minus the baseline, times 1 for the move made minus the chances. `spread` is how much single estimates disagree.

Taking the same number off every return leaves the long-run average alone, because the (move minus chances) part averages to zero. What it changes is how far each single estimate strays.
