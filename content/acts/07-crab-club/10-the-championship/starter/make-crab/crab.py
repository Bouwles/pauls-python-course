# Sir Reginald, the championship crab.
#
# Say here, for the committee, what he does and why each setting is what it is.

import numpy as np

from course import MAX_MOVES, OutOfPractice, STEPS


# Lady Agatha raced the club's course every Sunday for three years and never
# lost. The first Sunday they moved the rocks, she sat down on the start line
# and would not race. The machine on the hill has only ever known one town. A.P.
def train(practice, rng):
    """Practise until the stewards say stop. Returns a policy: rows of actions, 0 to 3."""
