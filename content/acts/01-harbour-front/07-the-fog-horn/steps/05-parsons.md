---
id: parsons
type: parsons
title: Ships in the night
dialogue:
  - tom: "I log every ship that passes in fog. By name, if they'll tell me."
blocks:
  - { code: "ships = 0", indent: 0 }
  - { code: 'name = input("Ship? ")', indent: 0 }
  - { code: 'while name != "dawn":', indent: 0 }
  - { code: "ships = ships + 1", indent: 1 }
  - { code: 'name = input("Ship? ")', indent: 1 }
  - { code: 'print(f"{ships} ships passed")', indent: 0 }
check: run
hints:
  nudge: "Which lines happen once, and which happen for every ship? There are two input lines: one belongs before the loop."
  plan:
    - Start the counter at zero
    - Ask before the loop
    - Loop until the sentinel
    - Count, then ask again at the bottom
    - Report after the loop
  shape: |
    ships = 0
    name = input("Ship? ")
    while name != "dawn":
        ___
        ___
    print(f"{ships} ships passed")
---
Tom types each ship's name as it passes, and `dawn` when the night is over. Arrange the lines so the program counts the ships.

```
Ship? Kestrel
Ship? Mary Rose
Ship? dawn
2 ships passed
```
