---
id: learn-memory
type: learn
title: A network with a memory
concept: rnns
dialogue:
  - aaesha.thinking.point: "One gauge reading can't tell you if the river's rising or falling. You have to remember the hours before."
code: |
  readings = [0.0, 1.0, 1.0, 0.0, 0.0]
  memory = 0.0                        # nothing remembered yet

  for reading in readings:
      memory = 0.8 * memory + reading     # keep most of the old, add the new
      print(round(memory, 2))
---
A tide reading on its own says little: 2.6 metres could be rising or falling. The hours before it say which. So a tide network has to read the readings in order, and remember.

A **recurrent neural network**, an RNN, reads a sequence one item at a time and keeps a **hidden state** between items: its memory. Each step makes a new memory from the new reading and the old memory, with the same weights every step, so it can read a sequence of any length. The memory starts empty, at 0, and is carried from step to step.

In the example the memory keeps eight tenths of itself each step and adds the new reading. Two 1s build it up to `1.8`, and it fades slowly once they stop.

The usual mistake is emptying the memory inside the loop. Then it remembers nothing.
