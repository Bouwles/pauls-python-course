---
id: make
type: make
title: Make the tide table pass
files: [tides.py, test_tides.py]
entry: test_tides.py
starter_from: test-first
on_pass: { agnes: "Every test passes, and they fail when they should. Requirement three is met." }
hints:
  nudge: "For `high_waters`, what goes into the list first, and how do you get from one high water to the next?"
  plan:
    - Make your can_cross tests pass
    - "Write the high_waters tests first: the usual case, past midnight, a count of 0"
    - Run them and watch them fail
    - Start with an empty list and add times until it holds count of them
  shape: |
    def can_cross(depth, draught, margin=0.5):
        """..."""
        return depth ___ draught + margin


    def high_waters(first, count):
        """A list of count high water times, starting with first."""
        times = []
        high = ___
        while len(times) < ___:
            times.append(high)
            high = ___(high)
        return times
---
Now make your tests pass: write `can_cross` in `tides.py`.

Then Agnes's last requirement, tests first again. `high_waters(first, count)` returns a list of `count` high water times, starting with `first`:

```
high_waters("06:42", 3)  gives  ["06:42", "19:07", "07:32"]
```

Add its name to the `import` line, write its tests, watch them fail, then write it. `next_high` already does the arithmetic.

The checks run your tests on your code and on broken copies of the reference, and try `high_waters` with a count of 0.
