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
    counts[bucket] += 1
    estimates[bucket] += (reward - estimates[bucket]) / counts[bucket]


def choose_epsilon_greedy(estimates, counts, rng, epsilon=0.1):
    """With probability epsilon, any bucket at random. Otherwise the best estimate."""
    if rng.random() < epsilon:
        return int(rng.integers(len(estimates)))
    return int(np.argmax(estimates))


def choose_ucb(estimates, counts, rng, c=1.0):
    """An untried bucket first. Then the best estimate plus c * sqrt(ln(total) / count)."""
    for bucket in range(len(counts)):
        if counts[bucket] == 0:
            return bucket
    total = np.sum(counts)
    scores = estimates + c * np.sqrt(np.log(total) / counts)
    return int(np.argmax(scores))


def choose_thompson(estimates, counts, rng):
    """Draw a plausible rate for each bucket from Beta(wins + 1, losses + 1); pick the biggest."""
    wins = estimates * counts
    losses = counts - wins
    samples = rng.beta(wins + 1, losses + 1)
    return int(np.argmax(samples))


def practise(choose, rates, runs, rng):
    """Run `runs` practice runs, letting choose pick the bucket each time.

    A run on a bucket is good (reward 1) with that bucket's rate, otherwise 0.
    Returns (rewards, counts): each run's reward, and how often each bucket was tried.
    """
    estimates = np.zeros(len(rates))
    counts = np.zeros(len(rates), dtype=int)
    rewards = np.zeros(runs)
    for run in range(runs):
        bucket = choose(estimates, counts, rng)
        reward = 1 if rng.random() < rates[bucket] else 0
        update(estimates, counts, bucket, reward)
        rewards[run] = reward
    return rewards, counts


if __name__ == "__main__":
    strategies = {
        "greedy": lambda estimates, counts, rng: choose_epsilon_greedy(estimates, counts, rng, epsilon=0),
        "epsilon-greedy": choose_epsilon_greedy,
        "UCB": choose_ucb,
        "Thompson sampling": choose_thompson,
    }
    runs = np.arange(1, 1001)
    for name, choose in strategies.items():
        rewards, counts = practise(choose, RATES, 1000, np.random.default_rng(2026))
        favourite = BUCKETS[np.argmax(counts)]
        print(f"{name}: {int(rewards.sum())} good runs in 1000, mostly {favourite}")
        plt.plot(runs, np.cumsum(rewards) / runs, label=name)
    plt.axhline(max(RATES), linestyle="--", color="grey", label="the best bucket every time")
    plt.xlabel("Practice run")
    plt.ylabel("Good runs so far, as a fraction")
    plt.title("Sir Reginald's bait trials")
    plt.legend()
    plt.show()
