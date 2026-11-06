---
id: tests-for-the-hill
type: make
title: Tests for the clock
files: [test_clock.py, clock.py]
entry: test_clock.py
on_pass: { paul.proud.thumbs: "They fail on the controller, every one in the right place. Years of next week, and it took you an evening." }
hints:
  nudge: "One test per rule, and at each rule's edge: 1999 and 2000 metres, 4.39 and 4.4 mm, force 7 and force 8."
  plan:
    - Write a helper that builds a night from keyword arguments, with ordinary values for anything you leave out
    - Test each rule on its own, on both sides of its edge
    - Add the nights the controller never saw, the ones you found in the last step
    - Run test_clock.py, and expect some tests to fail on this controller; the checks also run them on one that follows the rules
  shape: |
    def night(dark=0, visibility_m=20000, ice_mm=0.0, wind=3):
        return {"dark": dark, "visibility_m": visibility_m, "ice_mm": ice_mm, "wind": wind}


    def test_heater_comes_on_early_in_a_gale():
        assert decide(night(ice_mm=4.0, wind=8))["heater"] is True
        assert decide(night(ice_mm=___, wind=7))["heater"] is ___
---
Write the tests in `test_clock.py`, from the rules in the brief. Leave `clock.py` as it is: it's the controller, and your tests are about it.

1. A helper that builds a night, with ordinary readings for anything you leave out.
2. For each rule, a test on both sides of its edge: 1999 and 2000 m, 499 and 500 m, 4.39 and 4.4 mm, force 7 and force 8.
3. Tests for the nights you found in the last step.

Running `test_clock.py` here runs nothing on its own: press Check.

Done: the checks run your tests three ways. On a controller that follows the rules exactly, every test passes. On this controller, some fail. On controllers with small, deliberate mistakes, your tests notice each one.
