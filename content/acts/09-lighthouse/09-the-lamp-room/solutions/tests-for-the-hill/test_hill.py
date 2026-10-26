"""Tests for the machine on the hill, from Old Tom's rules."""
from hill import decide


def night(dark=0, visibility_m=20000, tide_m=2.0, wind=3):
    return {"dark": dark, "visibility_m": visibility_m, "tide_m": tide_m, "wind": wind}


def test_a_clear_day_needs_nothing():
    assert decide(night()) == {"lamp": False, "horn": False, "gate": False}


def test_lamp_is_lit_every_dark_night():
    assert decide(night(dark=1))["lamp"] is True
    assert decide(night(dark=1, visibility_m=30000))["lamp"] is True


def test_lamp_is_lit_in_daytime_haze():
    assert decide(night(visibility_m=1999))["lamp"] is True
    assert decide(night(visibility_m=2000))["lamp"] is False


def test_horn_sounds_in_fog():
    assert decide(night(visibility_m=499))["horn"] is True
    assert decide(night(visibility_m=500))["horn"] is False


def test_horn_ignores_the_tide():
    assert decide(night(visibility_m=300, tide_m=4.8))["horn"] is True
    assert decide(night(visibility_m=300, tide_m=1.0))["horn"] is True


def test_gate_shuts_at_four_point_four():
    assert decide(night(tide_m=4.4))["gate"] is True
    assert decide(night(tide_m=4.39))["gate"] is False


def test_gate_shuts_early_in_a_gale():
    assert decide(night(tide_m=4.0, wind=8))["gate"] is True
    assert decide(night(tide_m=4.0, wind=7))["gate"] is False
    assert decide(night(tide_m=3.99, wind=10))["gate"] is False
