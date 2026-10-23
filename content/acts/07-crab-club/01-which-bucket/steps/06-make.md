---
id: make
type: make
title: Make the bait trials
files: [bandit.py]
entry: bandit.py
on_pass: { committee: "Thompson sampling. We shall have it embroidered on the blazers." }
hints:
  nudge: "All three strategies get the same estimates and counts. What does each one do with them before it calls np.argmax?"
  plan:
    - Nudge the estimate towards what happened, in place
    - "Epsilon-greedy: explore now and then, otherwise exploit the best so far"
    - "UCB: an untried bucket first, then estimate plus bonus"
    - "Thompson: wins and losses from the estimates and counts, one Beta sample each"
    - "practise: start knowing nothing, then choose, try it and see, update"
    - Run all four for 1000 runs, print a line each, plot good runs so far
  shape: |
    def choose_ucb(estimates, counts, rng, c=1.0):
        for bucket in range(len(counts)):
            if counts[bucket] == 0:
                return ___
        total = ___
        scores = estimates + c * np.sqrt(np.log(___) / counts)
        return int(np.argmax(scores))


    def choose_thompson(estimates, counts, rng):
        wins = ___
        losses = counts - wins
        samples = rng.beta(___, ___)
        return int(np.argmax(samples))


    def practise(choose, rates, runs, rng):
        ...
        for run in range(runs):
            bucket = choose(estimates, counts, rng)
            reward = 1 if rng.random() < ___ else 0
            update(estimates, counts, bucket, reward)
            rewards[run] = reward
        return rewards, counts
---
The committee's brief, in `bandit.py`. Every strategy takes `(estimates, counts, rng)` and returns a bucket number, so `practise` can take any of them as its `choose`. Greedy is epsilon-greedy with `epsilon=0`: a `lambda` will do.

Thompson sampling needs wins and losses. With rewards of 0 and 1, `estimates * counts` is the wins.

The checks pass in a seeded `rng` and call each strategy thousands of times, then look at how often it picks each bucket. Then they run the whole program and look for four lines and a chart: `plt.plot` the good runs so far divided by the runs so far (`np.cumsum` and `np.arange` help) for each strategy.
