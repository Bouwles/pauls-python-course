---
id: predict-memory
type: predict
title: What it remembers
concept: rnns
dialogue:
  - wendt: "Her network reads one hour at a time. Between hours it keeps a number. Eight numbers."
  - wendt: "Here's the idea with one number and no squashing. Old Tom could do it in his head."
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
  Run it. Then change 0.5 to 0.9, and then to 0.
---
A tide reading on its own says little: 2.6 metres could be rising or falling. The hours before it say which.

A **recurrent neural network** (RNN) reads a sequence one item at a time and keeps a **hidden state** between items: a memory, updated every step from the new reading and the old memory. The same weights are used at every step, so it can read a sequence of any length.
