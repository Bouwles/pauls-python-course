---
id: make
type: make
title: Make the quiz
files: [quiz.py]
entry: quiz.py
timeout_ms: 15000
on_pass: { gwen: "Seal pup, pup, a pup. All three right. The Lifeboat Crew will have to find something else to argue about." }
hints:
  nudge: "Which of these functions keep every item, and which keep only some? That decides where each comprehension's `if` goes."
  plan:
    - "Only some items: if at the end, and curly brackets for a set"
    - "key: value for a dictionary"
    - Keep the round's questions in the book's order
    - Every answer Gwen allows, in lower case
    - "A value for every item: if-else at the front"
    - Ask until the round is a real one
    - Shuffle, ask, then mark
    - "Doing, not building: a plain loop"
  shape: |
    def round_names(questions):
        return sorted({question["round"] for question in ___})


    def round_sizes(questions):
        return {name: ___ for name in round_names(questions)}


    def in_round(questions, name):
        wanted = name.strip().lower()
        return [question for question in questions ___ question["round"].lower() == wanted]


    def is_right(given, question):
        allowed = {answer.lower() for answer in [question["answer"]] + question.get("also", ___)}
        return given.strip().lower() ___ allowed


    def answer_sheet(questions, answers):
        return [
            f"{number}. {question['answer']}: right" ___ is_right(given, question)
            ___ f"{number}. {question['answer']}: you said {given.strip()}"
            for number, (question, given) in enumerate(zip(questions, answers), start=1)
        ]
---
Write the functions from the brief in `quiz.py`, then `main`. The comments are Moss's subgoals from Bea's orders.

```
Rounds: Local (4), Science (4), Sea (4), Words (4)
Which round? sea
1. What is the lowest point of the tide called?
> low water
...
Answers:
1. low water: right
2. a pup: you said kitten
...
Score: 3 out of 4
```

Your order will differ: that's the shuffle. The checks swap `random.shuffle` for one that reverses the round, so they know the order to expect. Shuffle with `random.shuffle`, then, and nothing else.

`score` and `answer_sheet` take the questions as asked and the answers in the same order. `zip` pairs them up.
