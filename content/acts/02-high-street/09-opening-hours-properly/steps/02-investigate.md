---
id: investigate
type: investigate
title: The shelf of ready-made modules
concept: standard-library
code: |
  import math
  from collections import Counter
  from datetime import datetime, timedelta
  from itertools import accumulate

  print(math.ceil(130 / 40))

  saturday = datetime(2026, 3, 14, 11, 30)
  print(saturday.strftime("%A"))
  print(saturday + timedelta(hours=2))

  visits = ["Sat", "Mon", "Sat", "Fri", "Sat"]
  print(Counter(visits).most_common(1))

  takings = [40, 25, 60]
  print(list(accumulate(takings)))
tasks:
  - id: ceil
    prompt: "130 apples, 40 to a crate, is 3.25 crates. Run it. What does `math.ceil` turn 3.25 into?"
    kind: answer
    accept: ["4", "four"]
    feedback: "4. `ceil` always rounds up, which is what crates need: nobody sells a quarter of one."
    wrong: "It's the first line of the output."
  - id: weekday
    prompt: "Add `print(saturday.weekday())` and run it. What number does Saturday get?"
    kind: answer
    accept: ["5", "five"]
    feedback: "5. `weekday()` counts Monday as 0, so Saturday is 5 and Sunday is 6."
    wrong: "Look at the last line of the output, after your new print."
  - id: most-common
    prompt: "What did `Counter(visits).most_common(1)` print? Copy it exactly."
    kind: answer
    accept: ["[('Sat', 3)]", "[(\"Sat\", 3)]"]
    feedback: "A list holding one tuple: the most common day, and how many times it came up. `[0][0]` would get just `Sat`."
    wrong: "Copy the whole line, brackets included."
  - id: christmas
    prompt: "Which day of the week is Christmas Day 2026? Add a line that prints it, using `datetime(2026, 12, 25).strftime(\"%A\")`."
    kind: run
    tests: |
      TESTS = [output("Christmas Day", expect="Friday", match="contains",
                      hint="Print datetime(2026, 12, 25).strftime(\"%A\") on a line of its own.")]
    solution: |
      import math
      from collections import Counter
      from datetime import datetime, timedelta
      from itertools import accumulate

      print(math.ceil(130 / 40))

      saturday = datetime(2026, 3, 14, 11, 30)
      print(saturday.strftime("%A"))
      print(saturday + timedelta(hours=2))

      visits = ["Sat", "Mon", "Sat", "Fri", "Sat"]
      print(Counter(visits).most_common(1))

      takings = [40, 25, 60]
      print(list(accumulate(takings)))
      print(datetime(2026, 12, 25).strftime("%A"))
---
Python comes with a shelf of modules already made: the **standard library**. `import math` brings in a whole module, used as `math.ceil`. `from datetime import datetime` brings in one thing from a module, used by its own name.

`timedelta` is a length of time. `accumulate` gives running totals: a stall's takings so far, day by day.
