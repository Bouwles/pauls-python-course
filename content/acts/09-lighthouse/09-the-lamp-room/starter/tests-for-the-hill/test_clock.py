"""Tests for the clock's controller, from the clockmaker's rules."""
from clock import decide

CLEAR_DAY = {"dark": 0, "visibility_m": 20000, "ice_mm": 0.0, "wind": 3}


def test_a_clear_day_needs_nothing():
    assert decide(CLEAR_DAY) == {"lamp": False, "fog_lamp": False, "heater": False}


# One test per rule, its edges, and the nights the controller never saw.
