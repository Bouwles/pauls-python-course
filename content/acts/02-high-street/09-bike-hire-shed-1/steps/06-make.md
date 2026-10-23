---
id: make
type: make
title: Make the bike
files: [bikes.py]
entry: bikes.py
on_pass: { kat: "Bike 7, out with Bea, twelve pounds. No handwriting involved." }
hints:
  nudge: "What does a bike need to remember about itself, and which method changes each of those things?"
  plan:
    - Give each new one its starting attributes
    - "Methods that change the object: hire, then give_back"
    - Check the rider before lending a bike out
    - "Methods that answer a question about it: describe"
  shape: |
    class Bike:
        def __init__(self, number, kind, rate):
            self.number = number
            self.kind = kind
            self.rate = rate
            self.rider = ___
            self.hours = ___

        def hire(self, rider):
            if self.rider is not None:
                return ___
            self.rider = ___
            return True

        def give_back(self, hours):
            self.hours ___ hours
            self.rider = None
            return ___

        def describe(self):
            if self.rider is None:
                where = "free"
            else:
                where = f"out with {___}"
            return f"Bike {self.number}, {self.kind}, £{self.rate:___} an hour, {where}"
---
Write `Bike` in `bikes.py`, as in the brief. The bottom of the file already uses it the way Dev will, and the comments are Moss's subgoals from the repair bench.

```
Bike 7, town, £4.00 an hour, free
Bike 7, town, £4.00 an hour, out with Bea
Bea owes £12.00
```

The checks make bikes of their own with other numbers, kinds and rates, try to hire the same bike twice, and give bikes back more than once.
