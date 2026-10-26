# The Q-Learning Crab: Sir Reginald learns the Club Course by racing it, and enters the Arcade League.
#
# Pinned inside the club's 1995 race book, in pencil:
# Lady Agatha learned the old course the way crabs do: wrong first, a few
# hundred times. The committee asked whether she could simply be told.
# She could not. The machine on the hill can't be told either. It can only
# be shown, which is not the same thing. A.P.

import json

import numpy as np
try:
    from workshop import show_grid  # draws in the workshop's output panel
except ImportError:  # anywhere else, drawing does nothing and the rest still runs
    def show_grid(*args, **kwargs):
        pass

from course import COLS, FINISH, MAX_MOVES, ROCKS, ROWS, START, race, random_start, show_policy, step


def choose(Q, tile, epsilon, rng):
    """Epsilon-greedy: any action with chance epsilon, otherwise the best so far."""


def q_update(Q, tile, action, reward, after, over, alpha=0.1, gamma=1.0):
    """One Q-learning update, in place. Returns the TD error."""


def train(races, rng, alpha=0.1, gamma=1.0, epsilon=0.1):
    """Q-learning from practice races, alternately from the start and from anywhere.

    Returns the Q-table: ROWS by COLS by 4.
    """
    # A Q-table of zeros: every tile, every action
    # For each practice race: START, or random_start(rng) every other race
    # Choose an action, take the step, update, move on, until the race is over or MAX_MOVES
    # Every hundredth race, show_grid(...) to watch him learn


def greedy_policy(Q):
    """The best action on every tile, as ROWS lists of COLS actions from 0 to 3."""


def save_entry(Q, path="league.json"):
    """Write the Q-table in the League's format."""


if __name__ == "__main__":
    # Train for 3000 practice races, show the greedy policy,
    # race it 50 times (race() from course.py, one seed each), print the average,
    # and save league.json.
    pass
