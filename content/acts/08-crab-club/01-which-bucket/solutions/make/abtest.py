# Riya's flyer test for League night, run as a bandit.

import matplotlib.pyplot as plt
import numpy as np

VERSIONS = ["three goes for a pound", "win a cuddly crab", "free go after six", "beat the crab"]
# The chance that a visitor handed each version comes in and plays. Only the
# visitors know these: run_test() may use them, but no strategy is allowed to look.
RATES = [0.10, 0.14, 0.08, 0.17]
VISITORS = 5000


def update(estimates, counts, version, reward):
    """Count one more visitor handed version, and nudge its estimate towards reward.

    Changes estimates and counts in place; returns nothing.
    """
    counts[version] += 1
    estimates[version] += (reward - estimates[version]) / counts[version]


def choose_even_split(estimates, counts, rng):
    """The plain A/B test: every version in turn, whatever the results so far."""
    return int(np.sum(counts)) % len(counts)


def choose_epsilon_greedy(estimates, counts, rng, epsilon=0.1):
    """With probability epsilon, any version at random. Otherwise the best estimate."""
    if rng.random() < epsilon:
        return int(rng.integers(len(estimates)))
    return int(np.argmax(estimates))


def choose_ucb(estimates, counts, rng, c=1.0):
    """An untried version first. Then the best estimate plus c * sqrt(ln(total) / count)."""
    for version in range(len(counts)):
        if counts[version] == 0:
            return version
    total = np.sum(counts)
    scores = estimates + c * np.sqrt(np.log(total) / counts)
    return int(np.argmax(scores))


def choose_thompson(estimates, counts, rng):
    """Draw a plausible rate for each version from Beta(wins + 1, losses + 1); pick the biggest."""
    wins = estimates * counts
    losses = counts - wins
    samples = rng.beta(wins + 1, losses + 1)
    return int(np.argmax(samples))


def run_test(choose, rates, visitors, rng):
    """Hand one flyer to each visitor, letting choose pick the version each time.

    A visitor comes in (reward 1) with their version's rate, otherwise 0.
    Returns (estimates, counts, rewards): each version's rate so far, how many
    visitors were handed it, and every visitor's reward, in order.
    """
    estimates = np.zeros(len(rates))
    counts = np.zeros(len(rates), dtype=int)
    rewards = np.zeros(visitors)
    for visitor in range(visitors):
        version = choose(estimates, counts, rng)
        reward = 1 if rng.random() < rates[version] else 0
        update(estimates, counts, version, reward)
        rewards[visitor] = reward
    return estimates, counts, rewards


def regret(counts, rates):
    """The visitors a test is expected to have lost, against handing everyone the best version."""
    rates = np.array(rates)
    return float(np.sum(counts * (rates.max() - rates)))


def chance_best(estimates, counts, rng, draws=10000):
    """For each version, the chance that it is really the best, given what the test has seen."""
    wins = estimates * counts
    losses = counts - wins
    samples = rng.beta(wins + 1, losses + 1, size=(draws, len(counts)))
    best = np.argmax(samples, axis=1)
    return np.bincount(best, minlength=len(counts)) / draws


if __name__ == "__main__":
    strategies = {
        "even split": choose_even_split,
        "greedy": lambda estimates, counts, rng: choose_epsilon_greedy(estimates, counts, rng, epsilon=0),
        "epsilon-greedy": choose_epsilon_greedy,
        "UCB": choose_ucb,
        "Thompson sampling": choose_thompson,
    }
    results = {}
    print(f"{'strategy':18}{'came in':>8}{'lost':>6}  its pick")
    for name, choose in strategies.items():
        estimates, counts, rewards = run_test(choose, RATES, VISITORS, np.random.default_rng(2026))
        results[name] = (estimates, counts, rewards)
        pick = VERSIONS[int(np.argmax(estimates))]
        print(f"{name:18}{int(rewards.sum()):>8}{regret(counts, RATES):>6.0f}  {pick}")

    estimates, counts, _ = results["Thompson sampling"]
    chances = chance_best(estimates, counts, np.random.default_rng(1))
    winner = int(np.argmax(chances))
    print()
    print(f"Recommendation: {VERSIONS[winner]}, {chances[winner]:.0%} likely to be the best")

    visitors = np.arange(1, VISITORS + 1)
    for name, (_, _, rewards) in results.items():
        plt.plot(visitors, np.cumsum(rewards) / visitors, label=name)
    plt.axhline(max(RATES), linestyle="--", color="grey", label="the best flyer every time")
    plt.xlabel("Visitors so far")
    plt.ylabel("Came in, as a share of visitors")
    plt.title("The flyer test")
    plt.legend()
    plt.show()
