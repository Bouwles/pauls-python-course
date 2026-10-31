---
id: parsons
type: parsons
title: On the board
dialogue:
  - caitlin: "Anything under twenty doesn't go on the board. Even I agree on that."
blocks:
  - { code: "on_board = 0", indent: 0 }
  - { code: "while True:", indent: 0 }
  - { code: 'entry = input("Score? ")', indent: 1 }
  - { code: 'if entry == "done":', indent: 1 }
  - { code: "break", indent: 2 }
  - { code: "if int(entry) < 20:", indent: 1 }
  - { code: 'print("Too low for the board.")', indent: 2 }
  - { code: "continue", indent: 2 }
  - { code: "on_board = on_board + 1", indent: 1 }
  - { code: 'print(f"On the board: {on_board}")', indent: 0 }
check: run
hints:
  nudge: "Which word leaves the loop, and which one only skips the rest of this pass? done should leave; a low score should only be skipped."
  plan:
    - Start the counter at zero
    - Keep going until something stops it
    - Ask, and stop on the quit word
    - Skip the low ones without counting them
    - Count the rest
    - Report after the loop
  shape: |
    on_board = 0
    while True:
        entry = input("Score? ")
        if entry == "done":
            ___
        if int(entry) < 20:
            print("Too low for the board.")
            ___
        on_board = on_board + 1
    print(f"On the board: {on_board}")
---
Caitlin types in the day's scores from the arcade cabinet, then `done`. Arrange the lines so the low ones are turned away, only the rest are counted, and `done` ends it.

```
Score? 25
Score? 10
Too low for the board.
Score? 30
Score? done
On the board: 2
```
