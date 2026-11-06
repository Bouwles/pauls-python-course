---
id: make
type: make
title: Make the times table trainer
on_pass: { aaesha.pleased: "Nine sevens, sixty-three. It marked the slip wrong, which is right." }
hints:
  nudge: "Two loops again: one to print the twelve lines, one to ask the five questions. Where does the score start, and where is it printed?"
  plan:
    - Ask which table
    - Print every row, lined up
    - Start the score at zero
    - Ask each question in a loop
    - Mark it and keep score
    - Report the score once, after the loop
  shape: |
    table = int(input("Which table? "))
    for n in range(___, ___):
        print(f"{n:___} x {table} = {n * table:___}")
    print("Quiz time.")
    score = ___
    for n in range(___, ___):
        answer = int(input(f"{n} x {table}? "))
        if answer == ___:
            print("Right.")
            score = ___
        else:
            print(f"No, {___}.")
    print(f"Score: {score} out of 5")
---
Write the trainer for Aaesha's experiment: the table from 1 to 12, lined up, then five questions from 8 to 12, and the score.

```text
Which table? 7
 1 x 7 =   7
 2 x 7 =  14
...
12 x 7 =  84
Quiz time.
8 x 7? 56
Right.
9 x 7? 62
No, 63.
...
Score: 4 out of 5
```

Your file starts with Paul's six steps from the training chart, as comments. Use one `for` loop for the twelve lines and another for the five questions. In the table, the first number takes 2 characters, `{n:2}`, and the answer takes 3. Start the score at 0 once, before the questions.

The checks try other tables, all right and all wrong, and the twelves, where 144 needs all three characters.
