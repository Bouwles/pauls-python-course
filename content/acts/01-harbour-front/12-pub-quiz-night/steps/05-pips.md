---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Gwen's verdicts. They work. There's just a None at the end."
  - pip: "I think it's Python's way of saying the quiz is over."
dialogue_after:
  - pip: "So print is for people and return is for code. I was talking to the wrong one."
hints:
  nudge: "What does `verdict` hand back to `main()`? Where does that `None` come from?"
  plan:
    - Find where verdict gives its answer
    - Hand the remark back with return instead of printing it
    - Leave the printing to main()
  shape: |
    def verdict(score, total):
        if score * 2 >= total:
            ___ "Respectable."
        else:
            ___ "There's always next Tuesday."
---
Run Pip's program. It should print exactly:

```
You scored 3 out of 5.
Respectable.
```

Fix `verdict` so it hands its remark back. The checks also call `verdict` on its own.
