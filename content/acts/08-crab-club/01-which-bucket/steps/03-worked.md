---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.pleased: "The coffee machine in the Model Room. Three blends and a queue every morning."
  - paul.thinking.think: "Mostly it makes the best one. Now and then, one at random. Same shape of problem."
code: |
  import numpy as np

  BLENDS = ["decaf", "house", "dark roast"]
  COME_BACK = [0.40, 0.55, 0.75]   # the truth, which the machine doesn't know

  rng = np.random.default_rng(3)
  estimates = np.zeros(len(BLENDS))
  counts = np.zeros(len(BLENDS), dtype=int)
  epsilon = 0.1

  for customer in range(500):
      if rng.random() < epsilon:
          blend = int(rng.integers(len(BLENDS)))
      else:
          blend = int(np.argmax(estimates))
      came_back = 1 if rng.random() < COME_BACK[blend] else 0
      counts[blend] += 1
      estimates[blend] += (came_back - estimates[blend]) / counts[blend]

  for name, estimate, count in zip(BLENDS, estimates, counts):
      print(f"{name}: {count} cups, {estimate:.2f} came back for more")
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
This is **epsilon-greedy**. With probability `epsilon`, it **explores**: any blend at random, to learn something. Otherwise it **exploits**: the best estimate so far, to do well now. Every bandit strategy is a way of trading one against the other.

`rng.integers(3)` gives 0, 1 or 2: like `range`, the end is left out. `np.argmax` gives the index of the biggest value, the first one if there's a tie.

Run it, then try `epsilon = 0`.
