---
id: tests-for-the-hill
type: make
title: Tests for the hill
files: [test_hill.py, hill.py]
entry: test_hill.py
on_pass: { penhallow: "They fail on the machine, every one in the right place. Fifteen years of wondering, and it took you an evening." }
hints:
  nudge: "One test per rule, and at each rule's edge: 1999 and 2000 metres, 4.39 and 4.4 metres, force 7 and force 8."
  plan:
    - Write a helper that builds a night from keyword arguments, with ordinary values for anything you leave out
    - Test each rule on its own, on both sides of its edge
    - Add the nights the machine never saw, the ones you found in the last step
    - Run test_hill.py, and expect some tests to fail on this machine; the checks also run them on one that follows the rules
  shape: |
    def night(dark=0, visibility_m=20000, tide_m=2.0, wind=3):
        return {"dark": dark, "visibility_m": visibility_m, "tide_m": tide_m, "wind": wind}


    def test_gate_shuts_early_in_a_gale():
        assert decide(night(tide_m=4.0, wind=8))["gate"] is True
        assert decide(night(tide_m=___, wind=7))["gate"] is ___
---
Write the tests in `test_hill.py`. Leave `hill.py` as it is: it's the machine, and your tests are about it.

The checks run your tests three ways: on a machine that follows Tom's rules exactly (every test must pass), on this machine (some must fail), and on machines with small, deliberate mistakes in them (your tests must notice each one).

Running `test_hill.py` here runs nothing on its own. Press Check.
