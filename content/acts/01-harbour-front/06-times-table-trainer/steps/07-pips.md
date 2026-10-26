---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "I did Ellie's quiz. I set the score to nought. Twice, to be safe."
  - pip: "She got all five right. It says one out of five. She's upset. I'm upset."
dialogue_after:
  - pip: "Once is safe. Twice is every question. I'm writing that on my wing."
hints:
  nudge: "Trace it. What is `score` at the start of each pass? What happens to the point she won on the pass before?"
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
Pip's quiz does the nines, 8 to 12. Run it and answer all five right: 72, 81, 90, 99, 108. It should end:

```
Score: 5 out of 5
```

Trace `score` pass by pass on paper. Then fix it.
