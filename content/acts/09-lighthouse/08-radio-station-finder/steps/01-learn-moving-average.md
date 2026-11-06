---
id: learn-moving-average
type: learn
title: Smoothing a noisy signal
concept: slicing
code: |
  readings = [0.2, 0.2, 2.0, 0.2, 0.2]       # one loud crackle among the hiss
  half = 1                                    # one neighbour each side: a window of 3

  for i in range(len(readings)):
      nearby = readings[max(0, i - half): i + half + 1]
      print(i, nearby, round(sum(nearby) / len(nearby), 2))
---
A noisy signal jumps about from one reading to the next. A **moving average** calms it: each reading is replaced by the mean of itself and its neighbours. The **window** is how many readings go into each mean; a window of 5 is the reading and 2 neighbours each side.

A single loud reading among quiet ones gets watered down, because its neighbours are quiet. Something broad, high across several readings, survives, because its neighbours are high too.

At the ends there are fewer neighbours. `max(0, i - half)` stops the slice starting below 0, and a slice that runs past the end simply stops. Divide by how many readings the slice really holds, `len(nearby)`. The example turns the crackle's `2.0` into `0.8`, and the ends stay at `0.2`.
