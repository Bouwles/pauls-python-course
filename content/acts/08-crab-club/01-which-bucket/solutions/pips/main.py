import numpy as np

VERSIONS = ["three goes for a pound", "win a cuddly crab", "free go after six", "beat the crab"]
RATES = [0.10, 0.14, 0.08, 0.17]


def run_test(rates, visitors, rng, epsilon=0.1):
    estimates = np.zeros(len(rates))
    counts = np.zeros(len(rates), dtype=int)
    for visitor in range(visitors):
        best = int(np.argmax(estimates))
        if rng.random() < epsilon:
            version = int(rng.integers(len(rates)))
        else:
            version = best
        reward = 1 if rng.random() < rates[version] else 0
        counts[version] += 1
        estimates[version] += (reward - estimates[version]) / counts[version]
    return estimates, counts


if __name__ == "__main__":
    estimates, counts = run_test(RATES, 1000, np.random.default_rng(1))
    for name, estimate, count in zip(VERSIONS, estimates, counts):
        print(f"{name:>22}: handed out {count:4} times, estimate {estimate:.2f}")
