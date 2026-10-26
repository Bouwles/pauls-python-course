---
id: guess
type: investigate
title: Which growth is it?
concept: big-o
dialogue:
  - nell: "So you count it at one size, then at twice the size. Then what."
  - moss: "Then you ask which growth would have done that."
code: |
  import math


  def scale(n_now, n_later, growth):
      """How many times more work n_later items take than n_now."""
      if growth == "O(1)":
          return 1
      elif growth == "O(n)":
          return n_later / n_now
      elif growth == "O(n log n)":
          return (n_later * math.log(n_later)) / (n_now * math.log(n_now))
      elif growth == "O(n^2)":
          return (n_later / n_now) ** 2


  for growth in ["O(1)", "O(n)", "O(n log n)", "O(n^2)"]:
      print(growth, round(scale(1000, 2000, growth), 2))

  steps = [1000, 4000, 16000]
  for count in steps:
      print("#" * (count // 1000), count)
tasks:
  - id: doubling
    prompt: "Run it. When n doubles from 1,000 to 2,000, how many times more work is O(n^2)?"
    kind: answer
    accept: ["4", "4.0", "four", "x4", "4x", "4 times", "four times"]
    feedback: "Four. Twice the parts, squared. Each growth has its own number for a doubling, and that number is a fingerprint."
    wrong: "Read the line that starts with O(n^2)."
  - id: which
    prompt: "Another job took 9,966 steps for 1,000 parts and 21,932 for 2,000. Work out `21932 / 9966`. Which growth's number is it closest to?"
    kind: answer
    accept: ["O(n log n)", "n log n", "nlogn", "O(nlogn)", "o(n log n)", "n log(n)", "O(n log(n))"]
    feedback: "O(n log n): 2.2, where O(n) would be 2.0. Close, which is why the guess compares with every growth and keeps the nearest. That's how the speed tester will guess."
    wrong: "21932 / 9966 is about 2.2. Find the line that says 2.2."
  - id: log
    prompt: "Add a branch for `\"O(log n)\"`, which scales by `math.log(n_later) / math.log(n_now)`, and put it in the list after `\"O(1)\"`."
    kind: run
    tests: |
      TESTS = [
          function("A million is twice the log of a thousand", call="scale", args=(1024, 1_048_576, "O(log n)"), expect=2.0, tol=1e-6,
                   hint="One more elif, with growth == \"O(log n)\", returning math.log(n_later) / math.log(n_now)."),
          function("The others still work", call="scale", args=(1000, 2000, "O(n^2)"), expect=4.0, tol=1e-6),
      ]
    solution: |
      import math


      def scale(n_now, n_later, growth):
          """How many times more work n_later items take than n_now."""
          if growth == "O(1)":
              return 1
          elif growth == "O(log n)":
              return math.log(n_later) / math.log(n_now)
          elif growth == "O(n)":
              return n_later / n_now
          elif growth == "O(n log n)":
              return (n_later * math.log(n_later)) / (n_now * math.log(n_now))
          elif growth == "O(n^2)":
              return (n_later / n_now) ** 2


      for growth in ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)"]:
          print(growth, round(scale(1000, 2000, growth), 2))

      steps = [1000, 4000, 16000]
      for count in steps:
          print("#" * (count // 1000), count)
  - id: bars
    prompt: "One `#` per thousand steps runs off the page once the pier arrives. Change the last loop so the biggest bar is 20 `#`s long and the rest are in proportion: `round(count / max(steps) * 20)` of them."
    kind: run
    tests: |
      TESTS = [
          output("The biggest bar is 20 long", expect="# 1000\n##### 4000\n#################### 16000", match="contains",
                 hint="Work out the length first: round(count / max(steps) * 20). Then print that many #s, a space and the count."),
      ]
    solution: |
      import math


      def scale(n_now, n_later, growth):
          """How many times more work n_later items take than n_now."""
          if growth == "O(1)":
              return 1
          elif growth == "O(log n)":
              return math.log(n_later) / math.log(n_now)
          elif growth == "O(n)":
              return n_later / n_now
          elif growth == "O(n log n)":
              return (n_later * math.log(n_later)) / (n_now * math.log(n_now))
          elif growth == "O(n^2)":
              return (n_later / n_now) ** 2


      for growth in ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)"]:
          print(growth, round(scale(1000, 2000, growth), 2))

      steps = [1000, 4000, 16000]
      for count in steps:
          length = round(count / max(steps) * 20)
          print("#" * length, count)
---
The speed tester's last two jobs, in miniature.

`scale` says how many times more work a bigger pile takes, for a given growth. Measure a job at n and at twice n, divide, and see which growth's number yours is nearest.

The bars at the bottom are the start of a growth chart: one line per size, longer for more steps.
