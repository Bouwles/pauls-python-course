---
id: make
type: make
title: Make the weighbridge desk
files: [weighbridge.py]
entry: weighbridge.py
on_pass: { nell: "Weighed the tipper wrong, pressed undo, and it was first in line again. That's the desk I wanted." }
hints:
  nudge: "Which end of the queue does a lorry join, which end is it weighed from, and which end does undo put it back on?"
  plan:
    - "__init__: an empty deque for the queue, an empty list for the undo stack, and a total of 0"
    - "arrive: append to the right of the queue"
    - "waiting: a new list made from the queue"
    - "weigh: nobody waiting? Hand back None. Otherwise popleft, add the kilos, push the pair onto the undo stack"
    - "undo: nothing on the stack? Hand back None. Otherwise pop the latest pair, take the kilos off, appendleft the lorry"
  shape: |
    class Weighbridge:
        def __init__(self):
            self.queue = ___()
            self.weighings = []
            self.total = 0

        def weigh(self, kilos):
            if not self.queue:
                return None
            lorry = self.queue.___()
            self.total = self.total + kilos
            self.weighings.append(___)
            return lorry

        def undo(self):
            if not self.weighings:
                return None
            lorry, kilos = self.weighings.___()
            self.total = ___
            self.queue.___(lorry)
            return lorry
---
Write the `Weighbridge` class in `weighbridge.py`; the main block below it runs the example from the brief.

The lorries wait in a `deque`: they join on the right and are weighed from the left. Each weighing goes onto an undo stack, a plain list, as a `(lorry, kilos)` pair. Undo pops the top pair, takes its kilos off the total, and puts the lorry back where it was before it was weighed: the front of the queue.

`waiting()` hands back `list(...)` of the queue, so changing that list can't change the queue.

The hidden checks undo with nothing to undo, weigh with nobody waiting, undo every weighing of the day, and check the queue really is a deque.
