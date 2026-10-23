import numpy as np

BUCKETS = ["sprats", "mussels", "bacon rind", "cheese", "whelks"]
RATES = [0.30, 0.55, 0.20, 0.45, 0.70]


def practise(rates, runs, rng, epsilon=0.1):
    estimates = np.zeros(len(rates))
    counts = np.zeros(len(rates), dtype=int)
    for run in range(runs):
        best = int(np.argmax(estimates))
        if rng.random() < epsilon:
            bucket = int(rng.integers(len(rates)))
        else:
            bucket = best
        reward = 1 if rng.random() < rates[bucket] else 0
        counts[bucket] += 1
        estimates[bucket] += (reward - estimates[bucket]) / counts[bucket]
    return estimates, counts


if __name__ == "__main__":
    estimates, counts = practise(RATES, 1000, np.random.default_rng(1))
    for name, estimate, count in zip(BUCKETS, estimates, counts):
        print(f"{name:>10}: tried {count:4} times, estimate {estimate:.2f}")
