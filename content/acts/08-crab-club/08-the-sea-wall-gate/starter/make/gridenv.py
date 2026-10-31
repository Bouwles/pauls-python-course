# The racing grid, in Gymnasium's shape: reset() and step(), and nothing else.

import numpy as np

TRACK = ["...F", ".#.P", "S..."]
MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]       # actions 0 to 3: up, down, left, right
SIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]
START = (2, 0)


class RacingGrid:
    """Observations are tile numbers, row * 4 + col: the start is 8, the finish 3."""

    n_observations = 12
    n_actions = 4

    def __init__(self, slip=0.2, max_steps=100):
        self.slip = slip
        self.max_steps = max_steps
        self.rng = np.random.default_rng()

    def reset(self, seed=None, options=None):
        """Back to the start. A new generator only if given a seed. Returns (observation, info)."""
        # Seed, then set the scene
        # Hand back the observation and an info dict

    def step(self, action):
        """One move. Returns (observation, reward, terminated, truncated, info)."""
        # Apply the action, slipping sideways with chance self.slip
        # Let the world move: off the edge or into the rock, it stays put
        # Was that safe? Reward, terminated, truncated
        # Hand back five things, with {"slipped": ...} as the info


def run_episode(env, policy, seed=None):
    """One episode, choosing each action with policy(observation). Returns (total reward, steps)."""


# The best line from the Gridworld Solver, by tile number.
BEST_LINE = {0: 3, 1: 3, 2: 3, 4: 0, 6: 0, 8: 0, 9: 3, 10: 0, 11: 2}


if __name__ == "__main__":
    env = RacingGrid()
    rng = np.random.default_rng(1)
    for name, policy in [("Random moves", lambda observation: int(rng.integers(4))),
                         ("The best line", lambda observation: BEST_LINE[observation])]:
        env.reset(seed=2026)
        results = [run_episode(env, policy) for _ in range(1000)]
        print(f"{name}: {np.mean([total for total, _ in results]):.2f} on average, "
              f"{np.mean([steps for _, steps in results]):.1f} steps")
