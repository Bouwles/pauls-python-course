---
id: predict
type: predict
title: One pass
concept: simple-sorts
dialogue:
  - neil.thinking.point: "The obvious way. Find the fastest lap, put it at the front. Then the next."
code: |
  laps = [5, 2, 8, 1, 9]
  fastest = 0
  for position in range(1, len(laps)):
      if laps[position] < laps[fastest]:
          fastest = position
  laps[0], laps[fastest] = laps[fastest], laps[0]
  print(laps)
question: What does this print?
options:
  - text: "[1, 2, 8, 5, 9]"
    correct: true
    feedback: "Right. One pass finds the fastest, 1 tenth off in position 3, and swaps it with whatever was at the front. The 5 lands where the 1 was."
  - text: "[1, 2, 5, 8, 9]"
    misconception: one-pass-sorts
    feedback: "One pass puts one lap in its place: the fastest, at the front. The rest are only moved if they were in the way. It takes a pass for each position."
  - text: "[1, 5, 2, 8, 9]"
    misconception: swap-shifts-along
    feedback: "A swap trades two places and leaves everything else where it was. The 5 goes to position 3, where the 1 came from; the 2 doesn't move."
  - text: An IndexError
    misconception: index-is-the-value
    error: IndexError
    feedback: "`fastest` holds a position, not a time: 0, then 1, then 3. `laps[3]` is the lap 1 tenth off, well inside the list."
after: |
  Run it, then press Step through and watch the bars: one walk along the pile to find the fastest, then one swap.
---
Each lap is its time off the track record, in tenths of a second: 2 means two tenths slower. Smaller is faster.

**Selection sort**: find the fastest lap and swap it to the front. Then find the fastest of the rest and swap it into second place, and so on down the pile. This code is the first pass.

The step-through draws a list of numbers as a row of bars, one per lap, so you can watch a sort happen.
