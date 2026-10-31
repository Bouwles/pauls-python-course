# Race day: the crab against courses it has never seen, and the League course for the League.

import json
from collections import deque

import numpy as np
try:
    from workshop import show_grid  # draws in the workshop's output panel
except ImportError:  # anywhere else, drawing does nothing and the rest still runs
    def show_grid(*args, **kwargs):
        pass

from course import MAX_MOVES, STEPS, Course, Practice, generate, race
from crab import train

BUDGET = 5000                # practice moves the League allows on each course
TRAINING = [1, 2, 3]         # courses for trying out ideas
TESTING = [101, 102]         # courses kept back until the end


if __name__ == "__main__":
    rng = np.random.default_rng(2026)
