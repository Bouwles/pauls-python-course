---
id: learn-selection
type: learn
title: Fastest to the front
concept: simple-sorts
dialogue:
  - neil.thinking.point: "The obvious way. Find the fastest lap, put it at the front. Then the next."
code: |
  laps = [6, 4, 9, 1]
  for start in range(len(laps) - 1):
      fastest = start
      for position in range(start + 1, len(laps)):
          if laps[position] < laps[fastest]:
              fastest = position
      laps[start], laps[fastest] = laps[fastest], laps[start]
      print(laps)
---
Each lap in this project is its time off the track record, in tenths of a second. Smaller is faster.

**Selection sort** puts a pile in order one place at a time. Picture the laps as cards on a table: find the fastest and swap it into first place. Then find the fastest of the rest and swap it into second place, and so on.

`fastest` holds a position, not a time. `laps[start], laps[fastest] = laps[fastest], laps[start]` swaps two places at once. The example prints the pile after each pass: `[1, 4, 9, 6]`, `[1, 4, 9, 6]`, `[1, 4, 6, 9]`.

Each pass walks the rest of the pile, so it's O(n²). The usual slip is to think one pass sorts the pile. It puts one lap in its place.
