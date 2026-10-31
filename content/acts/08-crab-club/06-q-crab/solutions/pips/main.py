# Yahya's Q-learning, on the old racing grid. No numpy for the table: it's only twelve tiles.

import numpy as np

from track import ACTIONS, RACING, TRACK, random_start, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def train(races, rng, alpha=0.1, gamma=0.9, epsilon=0.1):
    """Q[row][col] is a list of four action values: up, down, left, right."""
    Q = [[[0.0] * 4 for col in range(COLS)] for row in range(ROWS)]
    for race in range(races):
        tile = random_start(rng)
        over = False
        while not over:
            row, col = tile
            if rng.random() < epsilon:
                action = int(rng.integers(4))
            else:
                action = Q[row][col].index(max(Q[row][col]))
            after, reward, over = step(tile, ACTIONS[action], rng)
            target = reward + (0 if over else gamma * max(Q[after[0]][after[1]]))
            Q[row][col][action] += alpha * (target - Q[row][col][action])
            tile = after
    return Q


def greedy(Q):
    """The best action on every racing tile."""
    best = {}
    for row, col in RACING:
        values = Q[row][col]
        best[(row, col)] = ACTIONS[values.index(max(values))]
    return best


if __name__ == "__main__":
    show_policy(greedy(train(3000, np.random.default_rng(5))))
