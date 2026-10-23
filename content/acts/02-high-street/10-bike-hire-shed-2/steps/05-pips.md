---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Electric bikes, Dev's way. I inherited everything."
  - pip: "Python says it has no rider. It inherited a rider. I watched it inherit it."
dialogue_after:
  - pip: "And == said None because the method just stopped. It didn't say False. It said nothing."
hints:
  nudge: "When `ElectricBike` writes its own `__init__`, does `Bike`'s `__init__` still run?"
  plan:
    - Read the traceback and ask who should have set the missing attribute
    - Let the parent set up its part
    - Run again and look at what == gives for something that isn't a bike
    - Make __eq__ give an answer in every case
  shape: |
    class Bike:
        def __eq__(self, other):
            if isinstance(other, Bike):
                return self.number == other.number
            return ___


    class ElectricBike(Bike):
        def __init__(self, number, rate, charge=100):
            ___.__init__(number, rate)
            self.charge = charge
---
Run Pip's program. It should print `True`, `True`, `False`. There are two bugs, one in each class.

`isinstance(other, Bike)` asks whether `other` is a bike, or a kind of bike. For anything else, `__eq__` should return `NotImplemented`: Python's way of saying "not my department", after which `==` gives `False`.
