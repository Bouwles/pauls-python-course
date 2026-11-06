---
id: predict-memory
type: predict
title: What it remembers
concept: rnns
dialogue:
  - neil.pleased.point: "One number, no squashing. You could do it in your head."
code: |
  readings = [1.0, 0.0, 0.0, 0.0]
  memory = 0.0

  for reading in readings:
      memory = 0.5 * memory + reading
      print(memory)
question: What does this print?
options:
  - text: |-
      1.0
      0.5
      0.25
      0.125
    correct: true
    feedback: "Right. The first reading goes in, then each hour half of what's remembered is kept. The 1 from the first hour is still there three hours later, fading."
  - text: |-
      1.0
      0.0
      0.0
      0.0
    misconception: rnn-memory-resets
    feedback: "That's a network that only sees the current reading. Here `memory` is kept from one pass of the loop to the next, so the first hour's reading is still in it."
  - text: |-
      1.0
      1.0
      1.0
      1.0
    misconception: rnn-memory-permanent
    feedback: "The old memory is multiplied by 0.5 every hour before the new reading is added. A memory weight under 1 makes old hours fade."
after: |
  Run it. Then change 0.5 to 0.9, and then to 0. A memory that fades a little each step makes a forgetting curve, the shape Hermann Ebbinghaus measured in his own memory in the 1880s.
---
A memory that keeps half of itself each step, reading a 1 and then three 0s.
