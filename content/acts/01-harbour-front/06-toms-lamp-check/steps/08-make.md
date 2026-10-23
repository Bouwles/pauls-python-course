---
id: make
type: make
title: Make the lamp check
on_pass: { tom: "Three checks, three, two, one, lit. Neater than my book." }
hints:
  nudge: "There are two jobs here, one after the other. Which range numbers the checks from 1, and which one counts down?"
  plan:
    - Find out how many times
    - Repeat, numbered from 1
    - Count down
    - Finish once, after the loops
  shape: |
    checks = int(input("Checks tonight? "))
    for check in range(___, ___):
        print(f"Check {check}: all well")
    for number in range(___, ___, ___):
        print(number)
    print("Lamp lit.")
---
Write Tom's lamp check. One line per check, numbered from 1, then a countdown from the same number, then the lamp.

```
Checks tonight? 3
Check 1: all well
Check 2: all well
Check 3: all well
3
2
1
Lamp lit.
```

Moss's labels from the radio are in the file. The checks try other numbers, including none at all.
