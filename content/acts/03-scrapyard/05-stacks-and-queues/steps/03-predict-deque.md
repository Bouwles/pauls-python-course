---
id: predict-deque
type: predict
title: The queue at the gate
concept: deque
code: |
  from collections import deque

  gate = deque(["flatbed", "tipper"])
  gate.append("council van")
  first = gate.popleft()
  gate.appendleft("crane lorry")
  print(first)
  print(list(gate))
question: What does this print?
options:
  - text: |-
      flatbed
      ['crane lorry', 'tipper', 'council van']
    correct: true
    feedback: "Right. The council van joins the back, the flatbed leaves from the front, and the crane lorry is put in at the front, ahead of the tipper."
  - text: |-
      council van
      ['crane lorry', 'flatbed', 'tipper']
    misconception: queue-serves-newest
    feedback: "`popleft` takes from the left, the front, where the lorry that has waited longest is. The council van only just arrived, at the back."
  - text: |-
      flatbed
      ['tipper', 'council van', 'crane lorry']
    misconception: appendleft-joins-back
    feedback: "`appendleft` adds on the left, which is the front of the queue. `append` is the one that joins the back."
---
A **queue** is used from both ends: join at the back, leave from the front. First come, first served, as at Nell's gate.

A list can do it with `pop(0)`, but each time the front lorry leaves, every lorry behind it is shuffled up a place: O(n) for every one served.

`collections.deque` (say "deck") is built for both ends. `append` and `pop` work at the right, `appendleft` and `popleft` at the left, and all four are O(1).
