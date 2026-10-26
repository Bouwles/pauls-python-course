# Learning by racing: the worth of every tile, learned from races alone.
# Nothing in this file may read outcomes(). Sir Reginald only gets step().

import numpy as np

from dp import evaluate
from track import RACING, TILES, TRADITIONAL, draw, random_start, show_values, step


def episode(policy, rng, start, limit=100):
    """One race from start, following policy. A list of (tile, action, reward), one per step."""
    # Race once, keeping what happened at each step


def returns_from(rewards, gamma=0.9):
    """The return from every step of a race: what that step and everything after it were worth."""
    # Walk back from the end: the return from each step


def mc_evaluate(policy, races, rng, gamma=0.9):
    """Monte Carlo: every tile's worth is the average of the returns that followed it."""
    # Start knowing nothing
    # Race from random_start(rng), then walk back through the returns
    # Every visit is one more sample: nudge the running average


def td_update(values, tile, reward, after, over, alpha=0.1, gamma=0.9):
    """Nudge values[tile] towards reward plus gamma times the next tile's worth. Returns the TD error."""


def td_evaluate(policy, races, rng, alpha=0.1, gamma=0.9, limit=100):
    """TD(0): learn as he goes, one step at a time, from the next tile's estimate."""
    # Start knowing nothing
    # Race from random_start(rng); after every step, td_update the tile he left


if __name__ == "__main__":
    # The traditional line worked out from the map (evaluate, from dp.py),
    # then learned by Monte Carlo and by TD(0) from 2000 races each,
    # and how far each is from the map.
    pass
