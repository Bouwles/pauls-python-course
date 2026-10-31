---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "I did the grade part for Paul. It puts the letter straight on the screen. Instant."
  - caitlin: "Then None turns up in the brackets, and the C is on a line of its own. Can you look?"
dialogue_after:
  - caitlin: "So print is for people and return is for code. Mine was showing off to the wrong one."
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
Run Caitlin's program. It should print exactly:

```
Candidate 1: 53.7 (C)
```

Fix `grade` so it hands its letter back. The checks also call `grade` on its own, with other marks.
