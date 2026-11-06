---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased.wave: "Can you look at mine? Neil's scheduler, with heapq. Priority first in the tuple, so urgent comes out first."
  - riya.confused: "The tyres went in before the chain. Same priority. It did the chain first."
dialogue_after:
  - riya.surprised: "So the tuple was choosing between them, and it chose by the alphabet. C before T."
hints:
  nudge: "Two jobs both have priority 3. What does Python compare next, to decide which tuple is smaller?"
  plan:
    - Find what breaks the tie between two tuples with the same priority
    - Count the jobs as they arrive
    - Put the count between the priority and the job, so earlier arrivals win ties
    - Take the job from the right place in the tuple
  shape: |
    def add(self, job, priority):
        heapq.heappush(self.waiting, (priority, ___, job))
        self.arrived = ___


    def take(self):
        priority, arrival, job = ___
        return job
---
Riya's scheduler uses `heapq`, and stores each pit job as `(priority, job)`. Run it and read which job gets done second.

The checks add jobs with tied priorities in every order, mix adds and takes, and try jobs written as dictionaries, which Python can't compare at all.
