---
id: make
type: make
title: Make the bank pass
files: [bank.py, test_bank.py]
entry: test_bank.py
starter_from: test-first
on_pass: { agnes: "Every test passes, and they fail when they should. Requirement three is met, five months before March." }
hints:
  nudge: "`withdraw` already refuses when there isn't enough. How can `transfer` use what it says?"
  plan:
    - Make your transfer tests pass
    - "Write the add_interest tests first: an even amount, one that needs rounding, and nothing at all"
    - Run them and watch them fail
    - "Work out the interest in pence, round it, and pay it in only if it's more than 0"
  shape: |
    def transfer(self, other, pence):
        """..."""
        if not self.___(pence):
            return False
        other.___(pence)
        return True


    def add_interest(self, percent):
        """..."""
        interest = ___(self.balance * percent / 100)
        if interest ___ 0:
            self.deposit(interest)
        return interest
---
Now make your tests pass: write `transfer` in `bank.py`.

Then Agnes's last requirement, tests first again. `add_interest(percent)` pays in that much interest on the balance, rounded to the nearest penny, and returns what it paid:

```
2% on £12.50 pays 25 pence
2% on £19.99 pays 40 pence (39.98, rounded)
2% on nothing pays 0, and nothing goes in the history
```

Write its tests, watch them fail, then write it. `deposit` does the paying in.

The checks run your tests on your code and on broken copies of the reference, and try interest that rounds to nothing.
