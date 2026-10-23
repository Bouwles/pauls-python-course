---
id: parsons
type: parsons
title: The countdown
dialogue:
  - tom: "Three, two, one. I say it out loud. The gulls are used to it."
blocks:
  - { code: 'start = int(input("Count down from? "))', indent: 0 }
  - { code: 'print("Stand clear of the lens.")', indent: 0 }
  - { code: "for number in range(start, 0, -1):", indent: 0 }
  - { code: "print(number)", indent: 1 }
  - { code: 'print("Lamp lit.")', indent: 0 }
check: run
hints:
  nudge: "Which lines should happen once, and which once per number? Only those go inside the loop."
  plan:
    - Ask where to start
    - Warn once, before the loop
    - Count down inside the loop
    - Light the lamp once, after it
  shape: |
    start = int(input("Count down from? "))
    print("Stand clear of the lens.")
    for number in range(___):
        print(number)
    print("Lamp lit.")
---
Build Tom's countdown. Put the lines in order and indent the ones that belong inside the loop.

```
Count down from? 3
Stand clear of the lens.
3
2
1
Lamp lit.
```
