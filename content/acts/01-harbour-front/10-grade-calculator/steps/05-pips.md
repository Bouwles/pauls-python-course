---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mrs Vance's grades. Sanjay got a C. It says so, on a line of its own, above him."
  - pip: "Then None in the brackets. I think the C escaped."
dialogue_after:
  - pip: "So print is for people and return is for code. I was talking to the wrong one."
hints:
  nudge: "What does `grade` hand back to the f-string in `main()`? Where does that `None` come from?"
  plan:
    - Find where grade gives its answer
    - Hand the letter back with return instead of printing it
    - Leave the printing to main()
  shape: |
    def grade(mark):
        if mark >= 70:
            ___ "A"
        elif mark >= 60:
            ___ "B"
        ...
---
Run Pip's program. It should print exactly:

```
Sanjay: 53.7 (C)
```

Fix `grade` so it hands its letter back. The checks also call `grade` on its own, with other marks.
