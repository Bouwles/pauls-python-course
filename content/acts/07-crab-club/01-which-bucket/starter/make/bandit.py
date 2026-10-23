# Sir Reginald's bait trials.
#
# From the club's bait ledger, 1994, in pencil:
# Lady Agatha tried every bucket in the shed, one run each, before I let
# her choose. The committee called it dithering. She won the autumn cup on
# whelks and retired to the rock pool. The machine on the hill dithers too,
# on purpose. I taught it that before I taught it anything else. A.P.

import matplotlib.pyplot as plt
import numpy as np

BUCKETS = ["sprats", "mussels", "bacon rind", "cheese", "whelks"]
# The chance of a good run on each bait. Only the sea knows these:
# practise() may use them, but no strategy is allowed to look.
RATES = [0.30, 0.55, 0.20, 0.45, 0.70]


def update(estimates, counts, bucket, reward):
    """Count one more run on bucket and nudge its estimate towards reward.

    Changes estimates and counts in place; returns nothing.
    """
    # Nudge the estimate towards what happened


def choose_epsilon_greedy(estimates, counts, rng, epsilon=0.1):
    """With probability epsilon, any bucket at random. Otherwise the best estimate."""
    # Explore now and then
    # Otherwise exploit the best so far


def choose_ucb(estimates, counts, rng, c=1.0):
    """An untried bucket first. Then the best estimate plus c * sqrt(ln(total) / count)."""


def choose_thompson(estimates, counts, rng):
    """Draw a plausible rate for each bucket from Beta(wins + 1, losses + 1); pick the biggest."""


def practise(choose, rates, runs, rng):
    """Run `runs` practice runs, letting choose pick the bucket each time.

    A run on a bucket is good (reward 1) with that bucket's rate, otherwise 0.
    Returns (rewards, counts): each run's reward, and how often each bucket was tried.
    """
    # Start knowing nothing
    # For each run: let the strategy choose, try it and see, nudge the estimate


if __name__ == "__main__":
    # Practise each strategy for 1000 runs, each with its own np.random.default_rng(2026):
    # greedy (epsilon-greedy with epsilon=0), epsilon-greedy, UCB, Thompson sampling.
    # Print a line for each: its good runs, and the bucket it tried most.
    # Plot each one's good runs so far, divided by the runs so far. Then plt.show().
    pass
