---
id: parsons
type: parsons
title: Back in the sea
dialogue:
  - gwen: "Anything under twenty centimetres goes back. Even the fishermen agree on that."
blocks:
  - { code: "keepers = 0", indent: 0 }
  - { code: "while True:", indent: 0 }
  - { code: 'entry = input("Length in cm? ")', indent: 1 }
  - { code: 'if entry == "done":', indent: 1 }
  - { code: "break", indent: 2 }
  - { code: "if int(entry) < 20:", indent: 1 }
  - { code: 'print("Back in the sea.")', indent: 2 }
  - { code: "continue", indent: 2 }
  - { code: "keepers = keepers + 1", indent: 1 }
  - { code: 'print(f"Keepers: {keepers}")', indent: 0 }
check: run
hints:
  nudge: "Which word leaves the loop, and which one only skips the rest of this pass? done should leave; a small fish should only be skipped."
  plan:
    - Start the counter at zero
    - Keep going until something stops it
    - Ask, and stop on the quit word
    - Skip the small ones without counting them
    - Count the rest
    - Report after the loop
  shape: |
    keepers = 0
    while True:
        entry = input("Length in cm? ")
        if entry == "done":
            ___
        if int(entry) < 20:
            print("Back in the sea.")
            ___
        keepers = keepers + 1
    print(f"Keepers: {keepers}")
---
The boats are in, and Gwen measures the catch for the prize board. She types each length, then `done`. Arrange the lines so the small ones go back, only the rest are counted, and `done` ends it.

```
Length in cm? 25
Length in cm? 10
Back in the sea.
Length in cm? 30
Length in cm? done
Keepers: 2
```
