---
id: predict-greedy
type: predict
title: The greedy crab
concept: bandits
dialogue:
  - committee: "The method is simple. Always use the best bucket."
  - moss: "Best so far, you mean."
code: |
  def good_run(bucket, run):
      """The practice ledger: 1 for a good run, 0 for a bad one."""
      if bucket == "whelks":
          return 0 if run % 4 == 3 else 1   # three good runs in four
      return 1 if run % 3 == 0 else 0       # sprats: one in three


  buckets = ["sprats", "whelks"]
  estimates = [0.0, 0.0]
  counts = [0, 0]
  for run in range(300):
      choice = estimates.index(max(estimates))
      reward = good_run(buckets[choice], run)
      counts[choice] += 1
      estimates[choice] += (reward - estimates[choice]) / counts[choice]

  print(counts)
question: "The crab always takes the bucket with the best estimate so far. What does this print?"
options:
  - text: "[300, 0]"
    correct: true
    feedback: "Right. The first sprats run is good, so sprats' estimate goes above 0.0. Bad runs pull it down to a half, a third, but never to 0.0, where the untried whelks sit. The whelks are never tried, so their estimate never moves. Greedy can't find out what it doesn't try."
  - text: "[0, 300]"
    misconception: greedy-finds-best
    feedback: "The whelks are better, but nothing in the loop knows that. It only knows estimates, and the whelks' estimate stays 0.0 because they're never tried. Greedy can't discover a better bucket on its own."
  - text: "[2, 298]"
    misconception: greedy-switches-after-failure
    feedback: "The second run is bad, but that only pulls sprats' estimate from 1.0 to 0.5. It's still above the whelks' 0.0, so the crab sticks with sprats. One bad run never drags an estimate below an untried bucket's zero."
---
This is a **multi-armed bandit**: several choices (the arms, here the buckets), each paying off at its own unknown rate, and a limited number of tries. Each try teaches you about one arm only, the one you tried.

`estimates` holds the average reward from each bucket so far. Line 15 keeps it up to date without storing every result.

`index(max(...))` gives the first of the biggest, so ties go to sprats.
