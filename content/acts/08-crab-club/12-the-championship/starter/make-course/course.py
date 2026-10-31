# Race-day courses, by the Arcade League's rules.
#
# A course is a list of strings, one per row: S the start, F the finish,
# # a rock, ~ a rock pool, . sand. Every move costs -1 and the finish ends
# the race. The crab slips sideways one move in ten on sand, and
# thirty-five in a hundred in a rock pool, either way with equal chance.
# Into a rock or off the course, it stays put. A race stops at 100 moves.

from collections import deque

import numpy as np

MOVES = ["up", "down", "left", "right"]      # actions 0, 1, 2 and 3
STEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]
SIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]  # a slip turns up or down into left or right, and so on
SLIP_SAND = 0.1
SLIP_POOL = 0.35
MAX_MOVES = 100
ROCK_CHANCE = 0.1
POOL_CHANCE = 0.15
