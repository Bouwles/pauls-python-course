"""Tests for the machine on the hill, from Old Tom's rules."""
from hill import decide

CLEAR_DAY = {"dark": 0, "visibility_m": 20000, "tide_m": 2.0, "wind": 3}


def test_a_clear_day_needs_nothing():
    assert decide(CLEAR_DAY) == {"lamp": False, "horn": False, "gate": False}


# One test per rule, its edges, and the nights the machine never saw.
