"""Tests for the clock's controller, from the clockmaker's rules."""
from clock import decide


def night(dark=0, visibility_m=20000, ice_mm=0.0, wind=3):
    return {"dark": dark, "visibility_m": visibility_m, "ice_mm": ice_mm, "wind": wind}


def test_a_clear_day_needs_nothing():
    assert decide(night()) == {"lamp": False, "fog_lamp": False, "heater": False}


def test_lamp_is_lit_every_dark_night():
    assert decide(night(dark=1))["lamp"] is True
    assert decide(night(dark=1, visibility_m=30000))["lamp"] is True


def test_lamp_is_lit_in_daytime_haze():
    assert decide(night(visibility_m=1999))["lamp"] is True
    assert decide(night(visibility_m=2000))["lamp"] is False


def test_fog_lamp_comes_on_in_fog():
    assert decide(night(visibility_m=499))["fog_lamp"] is True
    assert decide(night(visibility_m=500))["fog_lamp"] is False


def test_fog_lamp_ignores_the_ice():
    assert decide(night(visibility_m=300, ice_mm=4.8))["fog_lamp"] is True
    assert decide(night(visibility_m=300, ice_mm=1.0))["fog_lamp"] is True


def test_heater_comes_on_at_four_point_four():
    assert decide(night(ice_mm=4.4))["heater"] is True
    assert decide(night(ice_mm=4.39))["heater"] is False


def test_heater_comes_on_early_in_a_gale():
    assert decide(night(ice_mm=4.0, wind=8))["heater"] is True
    assert decide(night(ice_mm=4.0, wind=7))["heater"] is False
    assert decide(night(ice_mm=3.99, wind=10))["heater"] is False
