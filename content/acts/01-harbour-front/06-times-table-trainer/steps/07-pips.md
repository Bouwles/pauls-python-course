---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased: "I made Aaesha a quiz on the nines. I tested it on one question. One out of one."
  - riya.worried: "Then Neil got all five right, and it said one out of five. Can you look at it?"
dialogue_after:
  - riya.thinking.think: "Once, before the loop. One question was never going to show me that. Test with five."
hints:
  nudge: "Trace it. What is `score` at the start of each pass? What happens to the point he won on the pass before?"
  plan:
    - Run it and answer all five right
    - Trace score pass by pass
    - Set it to zero once, before the loop, and nowhere else
  shape: |
    score = 0
    for n in range(8, 13):
        answer = int(input(f"{n} x 9? "))
        if answer == n * 9:
            print("Right.")
            score = ___
        else:
            print(f"No, {n * 9}.")
    print(f"Score: {score} out of 5")
---
Riya's quiz does the nines, 8 to 12. Run it and answer all five right: 72, 81, 90, 99, 108. It should end:

```
Score: 5 out of 5
```

Trace `score` pass by pass on paper. Then fix it.
