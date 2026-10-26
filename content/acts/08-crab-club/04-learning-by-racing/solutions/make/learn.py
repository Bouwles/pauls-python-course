# Learning by racing: the worth of every tile, learned from races alone.
# Nothing in this file may read outcomes(). Sir Reginald only gets step().

import numpy as np

from dp import evaluate
from track import RACING, TILES, TRADITIONAL, draw, random_start, show_values, step


def episode(policy, rng, start, limit=100):
    """One race from start, following policy. A list of (tile, action, reward), one per step."""
    steps = []
    tile = start
    over = False
    while not over and len(steps) < limit:
        action = policy[tile]
        after, reward, over = step(tile, action, rng)
        steps.append((tile, action, reward))
        tile = after
    return steps


def returns_from(rewards, gamma=0.9):
    """The return from every step of a race: what that step and everything after it were worth."""
    returns = [0.0] * len(rewards)
    total = 0.0
    for t in reversed(range(len(rewards))):
        total = rewards[t] + gamma * total
        returns[t] = total
    return returns


def mc_evaluate(policy, races, rng, gamma=0.9):
    """Monte Carlo: every tile's worth is the average of the returns that followed it."""
    values = {tile: 0.0 for tile in TILES}
    visits = {tile: 0 for tile in TILES}
    for race in range(races):
        steps = episode(policy, rng, random_start(rng))
        rewards = [reward for _, _, reward in steps]
        for (tile, _, _), sample in zip(steps, returns_from(rewards, gamma)):
            visits[tile] += 1
            values[tile] += (sample - values[tile]) / visits[tile]
        if race % 100 == 0:
            draw(values, policy, title=f"Monte Carlo, race {race}")
    return values


def td_update(values, tile, reward, after, over, alpha=0.1, gamma=0.9):
    """Nudge values[tile] towards reward plus gamma times the next tile's worth. Returns the TD error."""
    target = reward + (0 if over else gamma * values[after])
    error = target - values[tile]
    values[tile] += alpha * error
    return error


def td_evaluate(policy, races, rng, alpha=0.1, gamma=0.9, limit=100):
    """TD(0): learn as he goes, one step at a time, from the next tile's estimate."""
    values = {tile: 0.0 for tile in TILES}
    for race in range(races):
        tile = random_start(rng)
        over = False
        moves = 0
        while not over and moves < limit:
            after, reward, over = step(tile, policy[tile], rng)
            td_update(values, tile, reward, after, over, alpha, gamma)
            tile = after
            moves += 1
        if race % 100 == 0:
            draw(values, policy, title=f"TD(0), race {race}")
    return values


if __name__ == "__main__":
    rng = np.random.default_rng(2026)
    from_the_map = evaluate(TRADITIONAL)
    learned = [
        ("Monte Carlo, 2000 races", mc_evaluate(TRADITIONAL, 2000, rng)),
        ("TD(0), 2000 races", td_evaluate(TRADITIONAL, 2000, rng, alpha=0.05)),
    ]
    print("The traditional line, worked out from the map")
    show_values(from_the_map)
    for name, values in learned:
        print()
        print(name)
        show_values(values)
        biggest = max(abs(values[tile] - from_the_map[tile]) for tile in RACING)
        print(f"Furthest from the map: {biggest:.2f}")
