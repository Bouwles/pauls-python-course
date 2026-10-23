---
id: parsons
type: parsons
title: Back in the sea
dialogue:
  - gwen: "Anything under twenty centimetres goes back. Even the fishermen agree on that."
blocks:
  - { code: "keepers = 0", indent: 0 }
  - { code: "for fish in range(5):", indent: 0 }
  - { code: 'length = int(input("Length in cm? "))', indent: 1 }
  - { code: "if length < 20:", indent: 1 }
  - { code: 'print("Back in the sea.")', indent: 2 }
  - { code: "continue", indent: 2 }
  - { code: "keepers = keepers + 1", indent: 1 }
  - { code: 'print(f"Keepers: {keepers}")', indent: 0 }
check: run
hints:
  nudge: "A small fish should skip the counting, but the loop should carry on to the next fish. Which word does that?"
  plan:
    - Start the counter at zero
    - Measure five fish, one per pass
    - Skip the small ones
    - Count the rest
    - Report after the loop
  shape: |
    keepers = 0
    for fish in range(5):
        length = int(input("Length in cm? "))
        if length < 20:
            print("Back in the sea.")
            ___
        keepers = keepers + 1
    print(f"Keepers: {keepers}")
---
Five fish come out of the bucket, one at a time. Arrange the lines so the small ones go back and only the rest are counted.

```
Length in cm? 25
Length in cm? 10
Back in the sea.
Length in cm? 30
Length in cm? 15
Back in the sea.
Length in cm? 22
Keepers: 3
```
