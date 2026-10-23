---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Dev's bikes, done properly. A class and everything."
  - pip: "It says hire takes one argument but I gave it two. I gave it one. I counted."
dialogue_after:
  - pip: "Self counts. Even when you don't write it in the call."
hints:
  nudge: "Inside `hire`, which object is `self`, and how does `hire` get it?"
  plan:
    - Read the traceback and count the arguments Python passes
    - Give hire its self
    - Run again and read the next error
    - Keep the rate on the object, not in a local variable
  shape: |
    class Bike:
        def __init__(self, number, kind, rate):
            self.number = number
            self.kind = kind
            self.___ = rate
            self.rider = None

        def hire(___, rider):
            self.rider = rider
---
Run Pip's program. It should print `Bea 12`.

There are two bugs, and the second only shows itself once the first is fixed. Read each traceback from the bottom.
