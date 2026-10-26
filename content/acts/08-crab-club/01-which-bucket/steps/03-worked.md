---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Bea has three bun recipes and a queue of customers. Same shape of problem."
  - moss: "Mostly she bakes the best one. Now and then, one at random."
code: |
  import numpy as np

  RECIPES = ["plain", "currant", "cardamom"]
  COME_BACK = [0.40, 0.55, 0.75]   # the truth, which Bea doesn't know

  rng = np.random.default_rng(3)
  estimates = np.zeros(len(RECIPES))
  counts = np.zeros(len(RECIPES), dtype=int)
  epsilon = 0.1

  for customer in range(500):
      if rng.random() < epsilon:
          recipe = int(rng.integers(len(RECIPES)))
      else:
          recipe = int(np.argmax(estimates))
      came_back = 1 if rng.random() < COME_BACK[recipe] else 0
      counts[recipe] += 1
      estimates[recipe] += (came_back - estimates[recipe]) / counts[recipe]

  for name, estimate, count in zip(RECIPES, estimates, counts):
      print(f"{name}: {count} buns, {estimate:.2f} came back for more")
subgoals:
  - label: What the world knows and the learner doesn't
    lines: [3, 4]
  - label: Start knowing nothing
    lines: [6, 9]
  - label: Explore now and then
    lines: [12, 13]
  - label: Otherwise exploit the best so far
    lines: [14, 15]
  - label: Try it and see
    lines: [16, 16]
  - label: Nudge the estimate towards what happened
    lines: [17, 18]
  - label: Report what was learned
    lines: [20, 21]
explain:
  prompt: "Line 18 never keeps a list of past customers. How does it still end up with the average?"
  answer: "Each new result moves the estimate a fraction 1/count of the way towards it. The first result sets it outright, the second moves it halfway, the third a third of the way. After n results that is exactly the mean of all n, the same as sum divided by len, without keeping the list."
  concept: bandits
---
This is **epsilon-greedy**. With probability `epsilon`, it **explores**: any recipe at random, to learn something. Otherwise it **exploits**: the best estimate so far, to do well now. Every bandit strategy is a way of trading one against the other.

`rng.integers(3)` gives 0, 1 or 2: like `range`, the end is left out. `np.argmax` gives the index of the biggest value, the first one if there's a tie.

Run it, then try `epsilon = 0`.
