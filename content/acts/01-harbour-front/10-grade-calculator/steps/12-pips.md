---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.pleased: "I did the grade bit for Paul and it puts the letter straight up on the screen, instantly."
  - caitlin.confused: "But then None turns up in the brackets and the C ends up on a line of its own. Can you look?"
dialogue_after:
  - caitlin.laughing: "Oh, print is for people and return is for code, and mine was showing off to the wrong one."
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
