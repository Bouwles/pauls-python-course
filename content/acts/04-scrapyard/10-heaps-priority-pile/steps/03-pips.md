---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya: "Can you look at mine? A scheduler with heapq. Priority first in the tuple, so urgent comes out first."
  - riya: "My headphones went in before Paul's lamp. Same priority. It mended the lamp first."
dialogue_after:
  - riya: "So the tuple was choosing between them, and it chose by the alphabet. P before R."
hints:
  nudge: "Two repairs both have priority 3. What does Python compare next, to decide which tuple is smaller?"
  plan:
    - Find what breaks the tie between two tuples with the same priority
    - Count the repairs as they arrive
    - Put the count between the priority and the repair, so earlier arrivals win ties
    - Take the repair from the right place in the tuple
  shape: |
    def add(self, repair, priority):
        heapq.heappush(self.waiting, (priority, ___, repair))
        self.arrived = ___


    def take(self):
        priority, arrival, repair = ___
        return repair
---
A heap that hands back the smallest thing is a **priority queue**, if you put the priority first. Riya stores each repair as `(priority, repair)`, and tuples compare item by item: first the priorities, and only if those tie, the next thing along.

Run it and read who gets mended second.

The checks add repairs with tied priorities in every order, mix adds and takes, and try repairs written as dictionaries, which Python can't compare at all.
