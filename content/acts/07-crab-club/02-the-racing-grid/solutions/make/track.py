# The committee's racing grid, as a Markov decision process.

import numpy as np
from saltmarsh import show_grid

TRACK = [
    "...F",
    ".#.P",
    "S...",
]
START = (2, 0)
ACTIONS = ["up", "down", "left", "right"]
STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
SIDEWAYS = {"up": ["left", "right"], "down": ["left", "right"], "left": ["up", "down"], "right": ["up", "down"]}
STEP_REWARD = -1
FINISH_REWARD = 10
POOL_REWARD = -10
SLIP = 0.2   # how often he goes sideways instead, half each way

# Along the bottom and up the far side, as the club has raced since 1951.
TRADITIONAL = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right",
    (1, 0): "up", (1, 2): "up",
    (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",
}


def mark(tile):
    """The letter on a tile: '.', '#', 'F', 'P' or 'S'."""
    row, col = tile
    return TRACK[row][col]


def is_over(tile):
    """True on the finish and in the rock pool: the race is over."""
    return mark(tile) in "FP"


def reward_for(tile):
    """The reward for stepping onto tile."""
    if mark(tile) == "F":
        return FINISH_REWARD
    if mark(tile) == "P":
        return POOL_REWARD
    return STEP_REWARD


def move(tile, direction):
    """Where one step in direction leads. Off the edge or into the rock, he stays put."""
    row, col = tile
    d_row, d_col = STEPS[direction]
    new_row, new_col = row + d_row, col + d_col
    if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":
        return (new_row, new_col)
    return tile


def outcomes(tile, action, slip=SLIP):
    """Every (probability, next tile, reward, over) that can follow action on tile."""
    if is_over(tile):
        return []
    result = []
    for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:
        after = move(tile, direction)
        result.append((chance, after, reward_for(after), is_over(after)))
    return result


def race(policy, rng, start=START, slip=SLIP, limit=100):
    """One race from start, following policy. The rewards, in order."""
    tile = start
    rewards = []
    while not is_over(tile) and len(rewards) < limit:
        possible = outcomes(tile, policy[tile], slip)
        chances = [chance for chance, _, _, _ in possible]
        pick = rng.choice(len(possible), p=chances)
        _, tile, reward, _ = possible[pick]
        rewards.append(reward)
    return rewards


def discounted_return(rewards, gamma):
    """Each reward counts gamma times less than the one before it."""
    total = 0
    for reward in reversed(rewards):
        total = reward + gamma * total
    return total


# Up the left and along the top, and keep away from the pool.
MY_LINE = {
    (0, 0): "right", (0, 1): "right", (0, 2): "right",
    (1, 0): "up", (1, 2): "up",
    (2, 0): "up", (2, 1): "left", (2, 2): "up", (2, 3): "left",
}

ARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}


def show(policy):
    """Print a policy as arrows on the grid."""
    for row in range(len(TRACK)):
        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]
                       for col in range(len(TRACK[0]))))


def draw(policy=None, crab=None, title=None):
    """Draw the grid in the output panel: the policy's arrows, and Sir Reginald at crab."""
    values = [[None if m == "#" else {"F": FINISH_REWARD, "P": POOL_REWARD}.get(m, 0) for m in row] for row in TRACK]
    arrows = [[(policy or {}).get((row, col)) for col in range(len(TRACK[0]))] for row in range(len(TRACK))]
    show_grid(values, policy=arrows, crab=crab, walls=[(1, 1)], goal=[(0, 3)], title=title)


if __name__ == "__main__":
    rng = np.random.default_rng(2026)
    for name, policy in [("The traditional line", TRADITIONAL), ("My line", MY_LINE)]:
        print(name)
        show(policy)
        returns = [discounted_return(race(policy, rng), 0.9) for _ in range(1000)]
        print(f"Average return over 1000 races: {np.mean(returns):.2f}")
        print()
