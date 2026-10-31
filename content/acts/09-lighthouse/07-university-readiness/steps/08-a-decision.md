---
id: a-decision
type: explain
title: "Interview: a decision"
dialogue:
  - paul: "They're not checking you were right. They're checking you chose."
prompt: "Explain a design decision in your capstone, and the alternative you rejected. Write it the way you'd say it: four or five sentences."
answer: "The finance app keeps its rules in `money.py`, which knows nothing about files or the command line: a `Ledger` refuses an amount of 0, or spending written as money in. The alternative was checking the rules in `cli.py`, where the arguments come in: one file fewer, and quicker to write. I rejected it because rules buried in argument handling can only be tested by running the whole program. As it is, a test makes a `Ledger`, adds a spend of 0 and checks it's refused, with nothing to open and nothing to type. The cost is that `cli.py` passes everything through two other files, which is more to follow the first time you read it."
---
Now the second thing they ask for. If your capstone isn't finished, use any Job you've shipped. An interviewer would rather hear about something small you understand than something large you don't.

A good answer has four parts: the decision, the alternative, why you chose it, and what it cost. The cost is the part people leave out, and the part interviewers listen for. Every decision costs something. Saying what shows you saw it.

Write your answer, then compare it with Paul's. His answers are about projects from this course, told as if they were his own. This one is the Personal Finance App.
