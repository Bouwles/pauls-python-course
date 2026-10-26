"""The gate keeper: learns when to wind the gate, by tabular Q-learning."""

import numpy as np

from gate_env import TideGateEnv

# Where to cut the four numbers into bins. Between them, a row of the Q-table.
LEVELS = [2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75]   # harbour level: 8 bins
DIFFERENCES = [-0.5, 0.0, 0.5]                      # sea minus harbour: 4 bins
SHAPE = (len(LEVELS) + 1, len(DIFFERENCES) + 1, 5, 2)


def do_nothing(observation):
    """The baseline: leave the gate where it is, whatever the tide does."""
    return 1


def discretise(observation):
    """The four numbers as a tuple of small whole numbers: which row of the Q-table."""
    harbour, sea, gate, rise = (float(x) for x in observation)
    return (
        int(np.searchsorted(LEVELS, harbour)),
        int(np.searchsorted(DIFFERENCES, sea - harbour)),
        int(round(gate)),
        int(rise > 0),
    )


class GateKeeper:
    """Acts greedily on a learned Q-table."""

    def __init__(self, q_table):
        self.q_table = q_table

    def act(self, observation):
        return int(np.argmax(self.q_table[discretise(observation)]))


def train(env, episodes, rng, alpha=0.1, gamma=0.99, epsilon=0.1):
    """Q-learning over many tides. Q starts at 100, the most a tide could be worth, so every action gets tried."""
    q_table = np.full(SHAPE + (3,), 1 / (1 - gamma))
    for _ in range(episodes):
        observation, _ = env.reset(seed=int(rng.integers(2**31)))
        state = discretise(observation)
        while True:
            if rng.random() < epsilon:
                action = int(rng.integers(3))
            else:
                action = int(np.argmax(q_table[state]))
            observation, reward, terminated, truncated, _ = env.step(action)
            after = discretise(observation)
            target = reward + (0.0 if terminated else gamma * q_table[after].max())
            q_table[state + (action,)] += alpha * (target - q_table[state + (action,)])
            state = after
            if terminated or truncated:
                break
    return q_table


def make_agent(seed=0):
    """Train a keeper on a gate of its own, and hand it over."""
    return GateKeeper(train(TideGateEnv(), 3000, np.random.default_rng(seed)))


def keep(env, act, seed):
    """One run of the gate from a seeded reset. How many quarter hours the harbour stayed safe."""
    observation, _ = env.reset(seed=seed)
    safe = 0.0
    while True:
        observation, reward, terminated, truncated, _ = env.step(act(observation))
        safe += reward
        if terminated or truncated:
            return safe


if __name__ == "__main__":
    env = TideGateEnv()
    keeper = make_agent()
    for name, act in [("Do nothing", do_nothing), ("The keeper", keeper.act)]:
        runs = [keep(env, act, 1000 + i) for i in range(20)]
        print(f"{name}: safe for {np.mean(runs):.1f} of 200 quarter hours, on average")
