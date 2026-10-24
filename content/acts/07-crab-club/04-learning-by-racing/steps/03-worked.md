---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Captain Ferro's crossing again. He's never seen the chart either. He's just crossed it a lot."
code: |
  import numpy as np

  OUTCOMES = {
      ("quay", "steady"): [(1.0, "mid-channel", -1)],
      ("quay", "full ahead"): [(0.9, "mid-channel", -1), (0.1, "aground", -20)],
      ("mid-channel", "steady"): [(0.7, "island", 5), (0.3, "mid-channel", -1)],
      ("mid-channel", "full ahead"): [(0.8, "island", 5), (0.2, "aground", -20)],
  }
  OVER = {"island", "aground"}
  POLICY = {"quay": "full ahead", "mid-channel": "steady"}
  GAMMA = 0.9


  def crossing(policy, rng):
      """One crossing: a list of (state, reward), one per turn. Only the sea reads OUTCOMES."""
      state = "quay"
      turns = []
      while state not in OVER:
          possible = OUTCOMES[(state, policy[state])]
          pick = rng.choice(len(possible), p=[chance for chance, _, _ in possible])
          _, after, reward = possible[pick]
          turns.append((state, reward))
          state = after
      return turns


  rng = np.random.default_rng(12)
  values = {"quay": 0.0, "mid-channel": 0.0}
  visits = {"quay": 0, "mid-channel": 0}
  for trip in range(1000):
      total = 0
      for state, reward in reversed(crossing(POLICY, rng)):
          total = reward + GAMMA * total
          visits[state] += 1
          values[state] += (total - values[state]) / visits[state]

  for state in values:
      print(f"{state}: worth {values[state]:.2f}, from {visits[state]} visits")
subgoals:
  - label: The sea's rules, which only the crossing itself may read
    lines: [3, 11]
  - label: Cross once, keeping what happened at each turn
    lines: [14, 24]
  - label: Start knowing nothing
    lines: [27, 29]
  - label: "Walk back from the end: the return from each turn"
    lines: [30, 33]
  - label: "Every visit is one more sample: nudge the running average"
    lines: [34, 35]
  - label: Report what was learned
    lines: [37, 38]
explain:
  prompt: "Mid-channel has 1313 visits from 1000 crossings. How can a state be visited more often than there were crossings, and is it right to count every visit?"
  answer: "Steady mid-channel waits a turn three times in ten, so some crossings visit it twice or more. Each visit is followed by a real return from that moment, so each is a fair sample of its worth. This is every-visit Monte Carlo. Counting only the first visit in each crossing also works, and both settle on the same value."
  concept: monte-carlo
---
On paper, with the chart, Ferro's quay is worth 0.65 and mid-channel 4.38. Run it and compare.

Line 35 is the running average from the bait trials: each new return moves the estimate `1 / visits` of the way towards it. No list of returns needed.

The learning part, lines 27 to 35, never looks at `OUTCOMES`. It only sees what `crossing` hands back.
