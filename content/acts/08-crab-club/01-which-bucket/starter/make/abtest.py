# Caitlin's attract-screen test for her new cabinet, run as a bandit.

import matplotlib.pyplot as plt
import numpy as np

VERSIONS = ["high-score table", "demo race", "flashing coin", "waving crab"]
# The chance that a visitor shown each version stops and plays. Only the
# visitors know these: run_test() may use them, but no strategy is allowed to look.
RATES = [0.10, 0.14, 0.08, 0.17]
VISITORS = 5000


def update(estimates, counts, version, reward):
    """Count one more visitor shown version, and nudge its estimate towards reward.

    Changes estimates and counts in place; returns nothing.
    """
    # Nudge the estimate towards what happened


def choose_even_split(estimates, counts, rng):
    """The plain A/B test: every version in turn, whatever the results so far."""


def choose_epsilon_greedy(estimates, counts, rng, epsilon=0.1):
    """With probability epsilon, any version at random. Otherwise the best estimate."""
    # Explore now and then
    # Otherwise exploit the best so far


def choose_ucb(estimates, counts, rng, c=1.0):
    """An untried version first. Then the best estimate plus c * sqrt(ln(total) / count)."""


def choose_thompson(estimates, counts, rng):
    """Draw a plausible rate for each version from Beta(wins + 1, losses + 1); pick the biggest."""


def run_test(choose, rates, visitors, rng):
    """Show one screen to each visitor, letting choose pick the version each time.

    A visitor plays (reward 1) with their version's rate, otherwise 0.
    Returns (estimates, counts, rewards): each version's rate so far, how many
    visitors were shown it, and every visitor's reward, in order.
    """
    # Start knowing nothing
    # For each visitor: let the strategy choose, try it and see, nudge the estimate


def regret(counts, rates):
    """The visitors a test is expected to have lost, against handing everyone the best version."""


def chance_best(estimates, counts, rng, draws=10000):
    """For each version, the chance that it is really the best, given what the test has seen."""
    # Draw `draws` plausible rates for every version at once, from the same Beta as Thompson sampling
    # Count how often each version's draw is the biggest


if __name__ == "__main__":
    # Run each strategy on VISITORS visitors, each with its own np.random.default_rng(2026):
    # the even split, greedy (epsilon-greedy with epsilon=0), epsilon-greedy, UCB, Thompson sampling.
    # Print a line for each: the visitors who played, the regret, and the version it rates best.
    # Recommend a version from Thompson sampling's results, with its chance_best.
    # Plot each one's visitors who played so far, divided by the visitors so far. Then plt.show().
    pass
