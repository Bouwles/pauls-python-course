"""Crate sums for the Studio's fruit order."""
# The supplier asked "how many crates?" They meant "how many crates,
# rounded up, because nobody sells a quarter of a crate." Most of this
# job is finding out what people meant. N.
import math


def crates_needed(items, per_crate):
    """How many crates hold this many items, rounded up."""
    return math.ceil(items / per_crate)
