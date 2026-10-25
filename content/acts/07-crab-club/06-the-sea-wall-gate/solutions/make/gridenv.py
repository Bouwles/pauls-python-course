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
        if seed is not None:
            self.rng = np.random.default_rng(seed)
        self.tile = START
        self.steps = 0
        return self._observation(), {}

    def step(self, action):
        slipped = bool(self.rng.random() < self.slip)
        if slipped:
            action = SIDEWAYS[action][0 if self.rng.random() < 0.5 else 1]
        row, col = self.tile[0] + MOVES[action][0], self.tile[1] + MOVES[action][1]
        if 0 <= row < 3 and 0 <= col < 4 and TRACK[row][col] != "#":
            self.tile = (row, col)
        self.steps += 1
        mark = TRACK[self.tile[0]][self.tile[1]]
        reward = {"F": 10.0, "P": -10.0}.get(mark, -1.0)
        terminated = mark in "FP"
        truncated = not terminated and self.steps >= self.max_steps
        return self._observation(), reward, terminated, truncated, {"slipped": slipped}

    def _observation(self):
        return self.tile[0] * 4 + self.tile[1]


def run_episode(env, policy, seed=None):
    """One episode, choosing each action with policy(observation). Returns (total reward, steps)."""
    observation, info = env.reset(seed=seed)
    total, steps = 0.0, 0
    while True:
        observation, reward, terminated, truncated, info = env.step(policy(observation))
        total += reward
        steps += 1
        if terminated or truncated:
            return total, steps


# The best line from Knowing the Track, by tile number.
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
