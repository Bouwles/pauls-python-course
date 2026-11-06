---
id: learn-timing
type: learn
title: Reading the clock
concept: timing-code
code: |
  import time

  laps = list(range(1_000_000))

  start = time.perf_counter()
  total = sum(laps)
  seconds = time.perf_counter() - start

  print(f"Adding a million laps: {seconds:.4f} s")
---
Counting steps tells you how the work grows. A clock tells you how long it really takes, on this computer, today. You need both.

`time.perf_counter()`, from the `time` module, reads a clock made for timing code. Picture a stopwatch someone started long ago and never reset: one reading is just a big number. Read it before the job and again after, and the difference is the seconds the job took.

The example times adding up a million numbers. Run it a few times. The seconds change every run, because the computer is busy with other things as well. That's normal.

The usual slip is to time something tiny. A job that takes a millionth of a second measures mostly the clock.
