---
id: learn-defensive
type: learn
title: Expect the odd line
concept: defensive-input
code: |
  LEVELS = ("INFO", "WARN", "ERROR")
  lines = ["00:00 | INFO | battery", "", "01:31 | warn | gps", "02:03 | LOUD | motors"]

  problems = []
  for number, line in enumerate(lines, start=1):
      if not line.strip():
          continue
      level = line.split("|")[1].strip().upper()
      if level in LEVELS:
          print(number, level)
      else:
          problems.append(f"line {number}: unknown level {level}")
  print(problems)
---
**Defensive input** means not trusting what comes in, whether a person typed it or a machine wrote it. Tidy it, check it, and decide what happens when it's wrong.

Neil's drone writes ` ERROR ` with spaces, `warn` in lower case, and the odd blank line.

Tidy first: `.strip().upper()` turns ` warn ` into `WARN`. Then check it's one of the levels. When it isn't, skip the line and say so: the example keeps a list of problems. `if not line.strip():` skips a blank line, because empty text counts as false. The example prints `1 INFO`, `3 WARN`, then the problem with line 4.

The usual slip is to skip bad input quietly. A report that hides what it skipped looks right, and isn't.
