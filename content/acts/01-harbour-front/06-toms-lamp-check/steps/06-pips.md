---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Why would range start at zero. Who decided that."
  - pip: "Anyway, I made it start at one. Now Tom says a check has gone missing."
dialogue_after:
  - pip: "It stops before the end. Every time. I'm writing that on my wing."
hints:
  nudge: "Type 3. How many check lines come out? Is the missing one at the start or the end?"
  plan:
    - Run it with 3 and count the lines
    - Work out where `range(1, checks)` stops
    - Make the range stop one later
  shape: |
    checks = int(input("Checks tonight? "))
    for check in range(1, ___):
        print(f"Check {check}: all well")
---
Run Pip's version and type `3`. Tom wants three checks, numbered 1 to 3:

```
Check 1: all well
Check 2: all well
Check 3: all well
```

Fix it so he gets the right number, whatever number he types.
