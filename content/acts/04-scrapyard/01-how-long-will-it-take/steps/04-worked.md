---
id: worked
type: worked
title: How Paul would time it
dialogue:
  - paul: "Counting tells you how it grows. A clock tells you where it starts. You need both."
code: |
  import time


  def total_weight(weights):
      total = 0
      for weight in weights:
          total = total + weight
      return total


  small = list(range(100_000))
  big = list(range(200_000))

  start = time.perf_counter()
  total_weight(small)
  small_seconds = time.perf_counter() - start

  start = time.perf_counter()
  total_weight(big)
  big_seconds = time.perf_counter() - start

  print(f"100,000 weights: {small_seconds:.4f} s")
  print(f"200,000 weights: {big_seconds:.4f} s")
  print(f"Twice the weights took {big_seconds / small_seconds:.1f} times as long")
  print(f"A million weights, at a guess: {small_seconds * 10:.3f} s")
subgoals:
  - label: Read the clock
    lines: [14, 14]
  - label: Do the job, once
    lines: [15, 15]
  - label: Read the clock again and subtract
    lines: [16, 16]
  - label: Do the same at twice the size
    lines: [18, 20]
  - label: Check the ratio against the growth you expect
    lines: [22, 24]
  - label: Scale up for the size you care about
    lines: [25, 25]
explain:
  prompt: "Run it three times. The seconds change every run. Why does Paul scale from the growth, not from one run at a million?"
  answer: "Each timing wobbles, because the computer is doing other things as well, so one measurement isn't the truth. The growth doesn't wobble: it's O(n), so ten times the weights is about ten times the time, whatever the clock said today."
  concept: timing-code
---
`time.perf_counter()` reads a clock made for timing code. One reading means nothing on its own; read it before and after, and subtract. The answer is in seconds.

Paul's `total_weight` looks at each weight once, so it's O(n): twice the weights should take about twice as long. The ratio won't be exactly 2. Timings never are.

Time something big enough to take a few hundredths of a second. A job that takes a millionth of a second measures mostly the clock.
