# Learning the policy directly: REINFORCE on the racing grid.

import numpy as np

from track import ACTIONS, RACING, START, TRACK, average_return, draw, is_over, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def chances(theta, tile):
    """The softmax of the tile's four preferences: the chance of each move."""
    # Turn preferences into chances


def grad_log_chance(theta, tile, action):
    """The gradient of log(chance of action on tile), for every number in theta."""


def race(theta, rng, limit=50):
    """One race from the start, every move drawn by chance. A list of (tile, action, reward)."""
    # Pick by chance


def returns_to_go(rewards, gamma=0.9):
    """For every step, the discounted return from that step to the end of the race."""


# I gave the machine on the hill the simplest rule there is: do more of
# whatever went well. It got very good at what went well. I never found a
# way to tell it why it had. A.P.
def reinforce_gradient(theta, races, gamma=0.9, baseline=None):
    """REINFORCE's estimate of which way is uphill for theta, averaged over races."""
    # Credit each move with the rewards after it
    # Score it against the baseline


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
    # Start with no preferences, and a baseline of nothing
    # For each episode: one race, then
    #     Nudge: more likely if better than the baseline
    #     Keep the baseline up to date
    #     If watch, draw the grid


if __name__ == "__main__":
    rng = np.random.default_rng(8)
    # 500 races at random for a baseline, then 200 fresh ones: print the spread
    # of their estimates without and with it. Then train for 500 races, watching,
    # and show his most likely moves and his average return over 1000 races.
    pass
