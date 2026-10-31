"""The gate keeper: learns when to wind the gate, by tabular Q-learning."""

import numpy as np

from gate_env import TideGateEnv

# Paul's suggestion for cutting the four numbers into bins. Change them if you like.
LEVELS = [2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75]   # harbour level: 8 bins
DIFFERENCES = [-0.5, 0.0, 0.5]                      # sea minus harbour: 4 bins
# With the gate's 5 notches and rising or falling: 8 x 4 x 5 x 2 rows of 3 actions.


def do_nothing(observation):
    """The baseline: leave the gate where it is, whatever the tide does."""
    return 1


def discretise(observation):
    """The four numbers as a tuple of small whole numbers: which row of the Q-table."""
    raise NotImplementedError


class GateKeeper:
    """Acts greedily on a learned Q-table."""

    def __init__(self, q_table):
        self.q_table = q_table

    def act(self, observation):
        raise NotImplementedError


def train(env, episodes, rng, alpha=0.1, gamma=0.99, epsilon=0.1):
    """Q-learning over many tides. Returns the Q-table."""
    # Start every Q-value high, at 1 / (1 - gamma): a keeper who expects the best tries everything
    # Each tide: env.reset(seed=...) with a seed drawn from rng, so the run can be repeated
    # Epsilon-greedy, step, and the Q-learning update; nothing after terminated
    raise NotImplementedError


def make_agent(seed=0):
    """Train a keeper on a gate of its own, and hand it over."""
    raise NotImplementedError


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
