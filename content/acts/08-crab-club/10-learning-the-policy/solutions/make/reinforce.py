# Learning the policy directly: REINFORCE on the racing grid.

import numpy as np

from track import ACTIONS, RACING, START, TRACK, average_return, draw, is_over, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def chances(theta, tile):
    """The softmax of the tile's four preferences: the chance of each move."""
    prefs = theta[tile]
    # Turn preferences into chances, biggest first taken away so exp can't overflow
    weights = np.exp(prefs - prefs.max())
    return weights / weights.sum()


def grad_log_chance(theta, tile, action):
    """The gradient of log(chance of action on tile), for every number in theta."""
    grad = np.zeros_like(theta)
    grad[tile] = -chances(theta, tile)
    grad[tile][action] += 1
    return grad


def race(theta, rng, limit=50):
    """One race from the start, every move drawn by chance. A list of (tile, action, reward)."""
    tile = START
    moves = []
    while not is_over(tile) and len(moves) < limit:
        # Pick by chance
        action = int(rng.choice(4, p=chances(theta, tile)))
        after, reward, _ = step(tile, ACTIONS[action], rng)
        moves.append((tile, action, reward))
        tile = after
    return moves


def returns_to_go(rewards, gamma=0.9):
    """For every step, the discounted return from that step to the end of the race."""
    returns = []
    total = 0.0
    for reward in reversed(rewards):
        total = reward + gamma * total
        returns.append(total)
    return returns[::-1]


def reinforce_gradient(theta, races, gamma=0.9, baseline=None):
    """REINFORCE's estimate of which way is uphill for theta, averaged over races."""
    grad = np.zeros_like(theta)
    for moves in races:
        # Credit each move with the rewards after it
        later = returns_to_go([reward for _, _, reward in moves], gamma)
        for (tile, action, _), ret in zip(moves, later):
            # Score it against the baseline
            score = ret if baseline is None else ret - baseline[tile]
            grad += score * grad_log_chance(theta, tile, action)
    return grad / len(races)


def spread(estimates):
    """How much a pile of gradient estimates disagree: the square root of their total variance."""
    return float(np.sqrt(np.var(np.array(estimates), axis=0).sum()))


def average_returns(races, gamma=0.9):
    """The average return that followed each tile, over some races: a baseline."""
    totals, counts = np.zeros((ROWS, COLS)), np.zeros((ROWS, COLS))
    for moves in races:
        later = returns_to_go([reward for _, _, reward in moves], gamma)
        for (tile, _, _), ret in zip(moves, later):
            totals[tile] += ret
            counts[tile] += 1
    return totals / np.maximum(counts, 1)


def train(episodes, rng, rate=0.1, gamma=0.9, use_baseline=True, watch=False):
    """One race and one step uphill per episode. Returns (theta, baseline)."""
    theta = np.zeros((ROWS, COLS, 4))
    baseline = np.zeros((ROWS, COLS))
    for episode in range(episodes):
        moves = race(theta, rng)
        # Nudge: more likely if better than the baseline
        theta += rate * reinforce_gradient(theta, [moves], gamma, baseline if use_baseline else None)
        # Keep the baseline up to date
        if use_baseline:
            later = returns_to_go([reward for _, _, reward in moves], gamma)
            for (tile, _, _), ret in zip(moves, later):
                baseline[tile] += 0.1 * (ret - baseline[tile])
        if watch:
            likely = {tile: ACTIONS[int(np.argmax(theta[tile]))] for tile in RACING}
            draw({tile: baseline[tile] for tile in RACING}, likely,
                 q={tile: chances(theta, tile) for tile in RACING}, title=f"race {episode + 1}")
    return theta, baseline


if __name__ == "__main__":
    rng = np.random.default_rng(8)
    untrained = np.zeros((ROWS, COLS, 4))
    at_random = average_returns([race(untrained, rng) for _ in range(500)])
    fresh = [race(untrained, rng) for _ in range(200)]
    without = [reinforce_gradient(untrained, [moves]) for moves in fresh]
    with_baseline = [reinforce_gradient(untrained, [moves], baseline=at_random) for moves in fresh]
    print(f"Spread of 200 estimates at random, no baseline: {spread(without):.2f}")
    print(f"Spread of 200 estimates at random, with a baseline: {spread(with_baseline):.2f}")
    print()
    theta, baseline = train(500, rng, watch=True)
    print("After 500 races with a baseline, its most likely moves")
    show_policy({tile: ACTIONS[int(np.argmax(theta[tile]))] for tile in RACING})
    worth = average_return(lambda tile: ACTIONS[int(rng.choice(4, p=chances(theta, tile)))], rng)
    print(f"Average return over 1000 races: {worth:.2f}")
