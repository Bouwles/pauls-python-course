---
id: pips
type: pips
title: Pip's Version
files: [tides.py, test_tides.py]
entry: test_tides.py
dialogue:
  - pip: "Agnes wanted tests. I wrote four. They all pass."
  - pip: "I broke tides.py on purpose to check. They still all pass. That's good, isn't it."
dialogue_after:
  - pip: "So a test that can't fail isn't a test. It's decoration."
hints:
  nudge: "If `next_high` were 25 minutes out, which of Pip's tests would notice?"
  plan:
    - Give every test an assert
    - Compare with an answer worked out by hand, not with the code itself
    - Remember that the comma in assert x, y makes y the message
    - Add a test for an edge, like a time after midnight
  shape: |
    def test_minutes():
        assert to_minutes("06:42") == ___


    def test_clock():
        assert to_clock(402) == ___


    def test_clock_after_midnight():
        assert to_clock(1500) == ___


    def test_next_high():
        assert next_high("06:42") == ___


    def test_low_after():
        assert low_after("06:42") == ___
---
Penhallow's code is in `tides.py`; Pip's tests are in `test_tides.py`. Run it: every test passes.

Fix the tests, not `tides.py`. When you press Check, your tests run against the real `tides.py`, then against copies with a bug planted in each function. A good test passes on the real one and fails on the broken one.

The tide book says high water at 06:42 is followed by low water at 12:55 and high water at 19:07.
