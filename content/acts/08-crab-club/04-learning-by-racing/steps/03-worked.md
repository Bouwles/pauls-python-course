---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.pleased: "Caitlin's platform level again. Nobody playing it has seen the numbers. They've just played it a lot."
code: |
  import numpy as np

  OUTCOMES = {
      ("start", "steady"): [(1.0, "halfway", -1)],
      ("start", "full speed"): [(0.9, "halfway", -1), (0.1, "pit", -20)],
      ("halfway", "steady"): [(0.7, "flag", 5), (0.3, "halfway", -1)],
      ("halfway", "full speed"): [(0.8, "flag", 5), (0.2, "pit", -20)],
  }
  OVER = {"flag", "pit"}
  POLICY = {"start": "full speed", "halfway": "steady"}
  GAMMA = 0.9


  def run(policy, rng):
      """One run: a list of (state, reward), one per turn. Only the game reads OUTCOMES."""
      state = "start"
      turns = []
      while state not in OVER:
          possible = OUTCOMES[(state, policy[state])]
          pick = rng.choice(len(possible), p=[chance for chance, _, _ in possible])
          _, after, reward = possible[pick]
          turns.append((state, reward))
          state = after
      return turns


  rng = np.random.default_rng(12)
  values = {"start": 0.0, "halfway": 0.0}
  visits = {"start": 0, "halfway": 0}
  for attempt in range(1000):
      total = 0
      for state, reward in reversed(run(POLICY, rng)):
          total = reward + GAMMA * total
          visits[state] += 1
          values[state] += (total - values[state]) / visits[state]

  for state in values:
      print(f"{state}: worth {values[state]:.2f}, from {visits[state]} visits")
subgoals:
  - label: The game's rules, which only the run itself may read
    lines: [3, 11]
  - label: Play once, keeping what happened at each turn
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
  prompt: "Halfway has 1313 visits from 1000 runs. How can a state be visited more often than there were runs, and is it right to count every visit?"
  answer: "Steady at halfway waits a turn three times in ten, so some runs visit it twice or more. Each visit is followed by a real return from that moment, so each is a fair sample of its worth. This is every-visit Monte Carlo. Counting only the first visit in each run also works, and both settle on the same value."
  concept: monte-carlo
---
On paper, with every chance known, the start is worth 0.65 and halfway 4.38. Run it and compare.

Line 35 is the running average from the A/B test bandit: each new return moves the estimate `1 / visits` of the way towards it. No list of returns needed.

The learning part, lines 27 to 35, never looks at `OUTCOMES`. It only sees what `run` hands back.
