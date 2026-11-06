---
id: predict-queue
type: predict
title: To the back of the queue
concept: queues
code: |
  waiting = ["Neil", "Riya"]
  waiting.append("Yahya")
  served = waiting.pop(0)
  waiting.append(served)
  print(waiting)
question: What does this print?
options:
  - text: "['Riya', 'Yahya', 'Neil']"
    correct: true
    feedback: "Right. Neil was first in, so he's served first, then joins the back again behind Yahya."
  - text: "['Neil', 'Riya', 'Yahya']"
    misconception: queue-serves-newest
    feedback: "That would be a stack, serving the newest arrival. `pop(0)` takes from the front, where Neil has waited longest."
---
The coffee machine queue. Whoever is served goes to the back for a second cup.
