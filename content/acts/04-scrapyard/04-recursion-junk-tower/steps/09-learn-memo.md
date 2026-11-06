---
id: learn-memo
type: learn
title: Write the answer down
concept: memoisation
code: |
  calls = []


  def ways(rungs, known):
      """Ways up a ladder, one or two rungs at a time."""
      calls.append(rungs)
      if rungs in known:
          return known[rungs]
      if rungs <= 1:
          answer = 1
      else:
          answer = ways(rungs - 1, known) + ways(rungs - 2, known)
      known[rungs] = answer
      return answer


  print(ways(25, {}), "ways,", len(calls), "calls")
---
Some recursive functions ask the same question again and again. **Memoisation** means writing each answer down the first time, and reading it back after that. Picture a board by the door: before working something out, check the board.

`ways` counts the ways up a ladder, one or two rungs at a step: the ways from one rung down plus the ways from two down. `known` is the board, a dictionary of answers by number of rungs. Lines 7 and 8 read it; line 13 writes to it. `calls` keeps one entry per call.

The example prints `121393 ways, 49 calls`. Delete lines 7, 8 and 13 and run it again: the same answer, after 242,785 calls.

The usual slip is to read the board but never write on it. Then it stays empty.
