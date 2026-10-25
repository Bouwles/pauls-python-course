# Actor and critic: Sir Reginald acts, and the critic judges every move as it happens.

import numpy as np

from track import ACTIONS, RACING, START, TRACK, average_return, draw, is_over, show_policy, step

ROWS, COLS = len(TRACK), len(TRACK[0])


def chances(theta, tile):
    """The softmax of the tile's four preferences, from Learning the Policy Directly."""
    prefs = theta[tile]
    weights = np.exp(prefs - prefs.max())
    return weights / weights.sum()


def grad_log_chance(theta, tile, action):
    """The gradient of log(chance of action on tile), from Learning the Policy Directly."""
    grad = np.zeros_like(theta)
    grad[tile] = -chances(theta, tile)
    grad[tile][action] += 1
    return grad


def td_error(values, tile, reward, after, over, gamma=0.9):
    """The critic's verdict on one move: how much better it went than the critic expected."""


def update(theta, values, tile, action, reward, after, over, gamma=0.9, actor_rate=0.2, critic_rate=0.2):
    """One step of actor-critic, in place. Returns the TD error."""
    # The critic's verdict, and which way makes this move likelier, before anything changes
    # The critic learns what the tile is worth
    # The actor makes the move likelier if it beat the critic's expectation


def train(episodes, rng, gamma=0.9, actor_rate=0.2, critic_rate=0.2, watch=False):
    """Actor-critic on the racing grid, learning after every move. Returns (theta, values)."""
    # Start with no preferences and no opinions
    # For each race, at most 50 moves: pick by chance; judge and learn, straight away
    # If watch, draw the grid after each race


def clipped_objective(ratio, advantage, epsilon=0.2):
    """PPO's objective for one move: the smaller of the plain and the clipped versions."""


if __name__ == "__main__":
    rng = np.random.default_rng(3)
    # Train for 200 races, watching. Show his most likely moves, the critic's
    # values and his average return over 1000 races. Then PPO's clip for a
    # ratio of 1.5 and of 0.5, each with an advantage of 2.0 and of -2.0.
    pass
