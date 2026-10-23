"""Crate sums for Sanjay."""
# He asked "how many crates?" He meant "how many crates, rounded up,
# because nobody sells a quarter of a crate." Most of this job is
# finding out what people meant. A.P.
import math


def crates_needed(items, per_crate):
    """How many crates hold this many items, rounded up."""
    return math.ceil(items / per_crate)
