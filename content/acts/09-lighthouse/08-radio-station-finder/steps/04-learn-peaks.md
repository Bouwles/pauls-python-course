---
id: learn-peaks
type: learn
title: Finding the peaks
concept: looping-lists
code: |
  smoothed = [0.1, 0.6, 0.9, 0.7, 0.2, 0.3, 0.2, 0.8]
  floor = 0.5

  for i in range(1, len(smoothed) - 1):          # never the first or the last
      before, here, after = smoothed[i - 1], smoothed[i], smoothed[i + 1]
      if here > before and here >= after and here >= floor:
          print("peak at", i, here)
---
On the smoothed dial, a station is a **peak**: a reading higher than the one before it and at least as high as the one after. Three more rules make it reliable:

- A **floor**: the peak must be at least this high. Hiss has small bumps too, and they aren't stations.
- Never the first or last reading: an end has only one neighbour, so nobody can say it's a peak.
- On a flat top, "higher than before, at least as high as after" picks only the first reading of the top, so a broad station counts once.

The example prints `peak at 2 0.9`. The bump at 5 is below the floor, and the 0.8 at the end is an end.

Then turn each peak's position into a frequency: the dial's start plus the position times the step.
