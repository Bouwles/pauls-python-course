# Race day: Sir Reginald against courses he has never seen, and the Club Course for the League.

import json
from collections import deque

import numpy as np
from saltmarsh import show_grid

from course import MAX_MOVES, STEPS, Course, Practice, generate, race
from crab import train

BUDGET = 5000                # practice moves the stewards allow on each course
TRAINING = [1, 2, 3]         # courses for trying out ideas
TESTING = [101, 102]         # courses kept back until the end


if __name__ == "__main__":
    rng = np.random.default_rng(2026)
