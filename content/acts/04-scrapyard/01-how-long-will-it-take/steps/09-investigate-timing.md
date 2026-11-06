---
id: investigate-timing
type: investigate
title: Time it twice
concept: timing-code
code: |
  import time

  laps = list(range(500_000))

  start = time.perf_counter()
  total = sum(laps)
  seconds = time.perf_counter() - start

  print(f"{len(laps)} laps: {seconds:.4f} s")
tasks:
  - id: same-every-run
    prompt: "Run it three times. Does it print the same time every run? Answer yes or no."
    kind: answer
    accept: ["no", "not quite", "nearly", "almost", "no, it changes", "it changes", "different", "they change", "no they change", "not always"]
    feedback: "No. Every timing wobbles a little. That's why one run is never the whole truth."
    wrong: "Run it a few more times and compare the last digits."
  - id: twice-the-laps
    prompt: "Time the same job at twice the size. Below the last line, make `big = list(range(1_000_000))`, time `sum(big)` the same way, and print `{len(big)} laps: {seconds:.4f} s` too."
    kind: run
    tests: |
      TESTS = [
          output("Two timings", expect=r"^500000 laps: \d+\.\d{4} s\n1000000 laps: \d+\.\d{4} s$", match="regex",
                 hint="Read the clock, sum(big), read it again and subtract, then print with the same f-string."),
      ]
    solution: |
      import time

      laps = list(range(500_000))

      start = time.perf_counter()
      total = sum(laps)
      seconds = time.perf_counter() - start

      print(f"{len(laps)} laps: {seconds:.4f} s")

      big = list(range(1_000_000))
      start = time.perf_counter()
      total = sum(big)
      seconds = time.perf_counter() - start
      print(f"{len(big)} laps: {seconds:.4f} s")
  - id: ratio
    prompt: "`sum` looks at each lap once. Run it a few times. Is the second time nearer twice the first, or nearer four times?"
    kind: answer
    accept: ["twice", "2", "two", "double", "nearer twice", "about twice", "roughly twice", "2x", "x2", "about 2", "around 2", "doubled", "it doubles", "twice the first", "near twice"]
    feedback: "Near twice, though rarely exactly. `sum` is O(n), so twice the laps is about twice the time. The growth is steady even when the clock wobbles."
    wrong: "It wobbles from run to run. Run it a few more times and look at what it does most often."
---
Neil wants to see the clock agree with the counting. This times `sum` on half a million laps.
