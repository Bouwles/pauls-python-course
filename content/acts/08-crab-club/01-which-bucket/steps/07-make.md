---
id: make
type: make
title: Make the A/B test bandit
files: [abtest.py]
entry: abtest.py
timeout_ms: 30000
on_pass: { riya: "Thompson sampling, twenty-six visitors lost. I can sell that to the print shop." }
hints:
  nudge: "Every strategy gets the same estimates and counts. What does each one do with them before it calls np.argmax?"
  plan:
    - Nudge the estimate towards what happened, in place
    - "The plain A/B test: each version in turn"
    - "Epsilon-greedy: explore now and then, otherwise exploit the best so far"
    - "UCB: an untried version first, then estimate plus bonus"
    - "Thompson: wins and losses from the estimates and counts, one Beta sample each"
    - "run_test: start knowing nothing, then choose, try it and see, update"
    - "regret: each version's visitors times its gap to the best"
    - "chance_best: many Beta draws at once, and how often each version comes out on top"
    - Run them all, print a line each and a recommendation, plot the running share
  shape: |
    def choose_even_split(estimates, counts, rng):
        return int(np.sum(counts)) % ___


    def choose_ucb(estimates, counts, rng, c=1.0):
        for version in range(len(counts)):
            if counts[version] == 0:
                return ___
        total = ___
        scores = estimates + c * np.sqrt(np.log(___) / counts)
        return int(np.argmax(scores))


    def choose_thompson(estimates, counts, rng):
        wins = ___
        losses = counts - wins
        samples = rng.beta(___, ___)
        return int(np.argmax(samples))


    def regret(counts, rates):
        rates = np.array(rates)
        return float(np.sum(counts * (___)))


    def chance_best(estimates, counts, rng, draws=10000):
        wins = ___
        losses = counts - wins
        samples = rng.beta(wins + 1, losses + 1, size=(draws, len(counts)))
        best = np.argmax(samples, axis=___)
        return np.bincount(best, minlength=len(counts)) / ___
---
Riya's brief, in `abtest.py`. Every strategy takes `(estimates, counts, rng)` and returns a version number, so `run_test` can take any of them as its `choose`. Plain greedy is epsilon-greedy with `epsilon=0`: a `lambda` will do.

Thompson sampling needs wins and losses. With rewards of 0 and 1, `estimates * counts` is the wins. `chance_best` draws ten thousand plausible rates for every version at once and counts how often each one comes out on top.

The checks pass in a seeded `rng` and call each strategy thousands of times, then look at how often it picks each version. Then they run the whole program and look for a line per strategy, a recommendation and a chart: `plt.plot` each strategy's visitors who came in so far, divided by the visitors so far. `np.cumsum` and `np.arange` help.
