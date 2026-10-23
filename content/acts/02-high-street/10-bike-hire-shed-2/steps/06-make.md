---
id: make
type: make
title: Make the shed
files: [bikes.py]
entry: bikes.py
on_pass: { kat: "Electric bike 9, eighty per cent, two pounds on top. And the shed is still a shed." }
hints:
  nudge: "Which of the three is a kind of bike, and which only has bikes?"
  plan:
    - "Teach Bike to show itself: __str__ and __repr__"
    - Decide what == means, for bikes and for everything else
    - Say what kind of thing ElectricBike is, and let the parent set up its part
    - "Change only what differs: the fee, the charge, and how it shows itself"
    - Give the shed a list of bikes and the methods a shed needs
  shape: |
    class ElectricBike(Bike):
        def __init__(self, number, rate, charge=100):
            super().___(number, rate)
            self.charge = charge

        def give_back(self, hours):
            cost = super().___(hours) + 2
            self.charge = max(0, self.charge - ___)
            return cost

        def __str__(self):
            return f"Electric bike {self.number} ({___}%)"


    class Shed:
        def __init__(self):
            self.bikes = ___

        def add(self, bike):
            self.bikes.append(bike)

        def free(self):
            return [bike for bike in self.bikes if ___]

        def __len__(self):
            return ___
---
Add the three pieces from the brief to `bikes.py`. `Bike` already works; extend it, don't rewrite it. The comments are Moss's subgoals from the cargo bike.

`max(0, n)` is `n`, but never less than 0.

```
Shed of 3 bikes
Free: [Bike(7, 4), Bike(12, 5)]
Electric bike 9 (80%)
```

The checks compare bikes with each other and with things that aren't bikes, run an electric bike flat, and fill a shed.
