---
id: make
type: make
title: Make the A/B test bandit
files: [abtest.py]
entry: abtest.py
timeout_ms: 30000
on_pass: { caitlin.proud.thumbs: "Thompson sampling, twenty-six visitors lost. The waving crab goes on the cabinet." }
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
Write `abtest.py`, Caitlin's brief. Each function uses one idea from this project:

- `update`: the running average, changed in place.
- `choose_even_split`: the plain A/B test, every version in turn. `choose_epsilon_greedy`, `choose_ucb` and `choose_thompson`: the three ways of exploring.
- `run_test`: the loop from Paul's coffee machine, with `choose` passed in. Every strategy takes `(estimates, counts, rng)`, so any fits. Plain greedy is epsilon-greedy with `epsilon=0`: a `lambda` will do.
- `regret`: what a test cost. `chance_best`: how sure the winner is.

Thompson needs wins: with rewards of 0 and 1, `estimates * counts` is the wins.

Run as a program, it prints the table from the brief, a recommendation, and draws a chart: each strategy's visitors who played so far, divided by the visitors so far. `np.cumsum(rewards)` gives the running totals.

The checks call each strategy thousands of times with a seeded `rng` and count its picks, then run the whole program.
