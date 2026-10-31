# The Arcade's racing grid, as a Markov decision process.

import numpy as np
try:
    from workshop import show_grid  # draws in the workshop's output panel
except ImportError:  # anywhere else, drawing does nothing and the rest still runs
    def show_grid(*args, **kwargs):
        pass

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
SLIP = 0.2   # how often it goes sideways instead, half each way

# Along the bottom and up the far side, the way everyone in the League races it.
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
    """Where one step in direction leads. Off the edge or into the rock, it stays put."""


def outcomes(tile, action, slip=SLIP):
    """Every (probability, next tile, reward, over) that can follow action on tile.

    On the finish or in the pool the race is over: nothing follows.
    """
    # What it was told, with chance 1 - slip
    # Each way sideways, with chance slip / 2


def race(policy, rng, start=START, slip=SLIP, limit=100):
    """One race from start, following policy. The rewards, in order.

    Stops when the race is over, or after limit steps.
    """
    # Follow the policy, letting chance pick each outcome


def discounted_return(rewards, gamma):
    """Each reward counts gamma times less than the one before it."""


# Your own line: an action for every tile it could be on. Beat tradition.
MY_LINE = dict(TRADITIONAL)

ARROWS = {"up": "^", "down": "v", "left": "<", "right": ">"}


def show(policy):
    """Print a policy as arrows on the grid."""
    for row in range(len(TRACK)):
        print(" ".join(ARROWS[policy[(row, col)]] if (row, col) in policy else TRACK[row][col]
                       for col in range(len(TRACK[0]))))


def draw(policy=None, crab=None, title=None):
    """Draw the grid in the output panel: the policy's arrows, and the crab on the tile crab."""
    values = [[None if m == "#" else {"F": FINISH_REWARD, "P": POOL_REWARD}.get(m, 0) for m in row] for row in TRACK]
    arrows = [[(policy or {}).get((row, col)) for col in range(len(TRACK[0]))] for row in range(len(TRACK))]
    show_grid(values, policy=arrows, crab=crab, walls=[(1, 1)], goal=[(0, 3)], title=title)


if __name__ == "__main__":
    rng = np.random.default_rng(2026)
    # For the traditional line and then yours: show it, race it 1000 times,
    # and print the average discounted return with gamma = 0.9.
    pass
