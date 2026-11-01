# The crab, for the Arcade League.
#
# Say here, for Caitlin, what it does and why each setting is what it is.

import numpy as np

from course import MAX_MOVES, OutOfPractice, STEPS


def train(practice, rng):
    """Practise until the League says stop. Returns a policy: rows of actions, 0 to 3."""
