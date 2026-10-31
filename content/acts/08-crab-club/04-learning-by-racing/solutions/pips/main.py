# Caitlin's TD(0), on the traditional line.

import numpy as np

from track import TILES, TRADITIONAL, random_start, show_values, step


def td_evaluate(policy, races, rng, alpha=0.05, gamma=0.9):
    values = {tile: 0.0 for tile in TILES}
    for race in range(races):
        tile = random_start(rng)
        over = False
        while not over:
            after, reward, over = step(tile, policy[tile], rng)
            target = reward + (0 if over else gamma * values[after])
            values[tile] += alpha * (target - values[tile])
            tile = after
    return values


if __name__ == "__main__":
    show_values(td_evaluate(TRADITIONAL, 2000, np.random.default_rng(1)))
