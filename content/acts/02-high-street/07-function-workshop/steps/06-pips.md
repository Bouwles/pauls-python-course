---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Each day gets its own print queue. I made sure of it."
  - pip: "Monday's queue has Tom's clock in it. Tom brought that in on Tuesday."
dialogue_after:
  - pip: "So the list in the def line is made once. Just the once. Forever."
hints:
  nudge: "When is the `[]` in the `def` line made: on every call, or once?"
  plan:
    - Give queue a default that is not a list
    - Make a new list inside the function when none was passed
    - Append and return as before
  shape: |
    def queue_label(text, queue=___):
        """Add a label to a print queue and return the queue."""
        if queue is ___:
            queue = ___
        queue.append(text)
        return queue
---
Run Pip's program. Monday's queue should hold only Bea's kettle, and Tuesday's only Tom's clock.

Fix it so a call with no queue gets a new, empty list every time. The usual way: default to `None`, and make the list inside the function. `if queue is None:` asks whether something is `None`.
