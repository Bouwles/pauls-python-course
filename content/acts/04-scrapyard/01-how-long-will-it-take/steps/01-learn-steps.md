---
id: learn-steps
type: learn
title: Counting the steps
concept: big-o
dialogue:
  - neil.thinking: "My script's instant on two hundred parts. That proves nothing, does it?"
code: |
  parts = ["axle", "bolt", "chain"]

  looks = 0
  for part in parts:
      looks = looks + 1
  print(looks)

  pairs = 0
  for first in parts:
      for second in parts:
          pairs = pairs + 1
  print(pairs)
---
How long a program takes depends mostly on how many **steps** it does: comparisons, additions, looks at a part. Count them, and you know a lot before you run anything.

Picture Neil going through a drawer of parts by hand. Looking at each part once is one look per part. Holding every part up against every part is one look per part, for every part.

The example counts both for three parts. The single loop counts 3. The loop inside a loop runs the whole inner loop on every pass of the outer one, so it counts 3 times 3. It prints `3`, then `9`.

The usual slip is to add the two loops, 3 plus 3. Loops inside loops multiply. Add a fourth part and run it.
