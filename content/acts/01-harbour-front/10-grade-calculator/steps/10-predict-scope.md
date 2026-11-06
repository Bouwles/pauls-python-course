---
id: predict-scope
type: predict
title: The point that went missing
concept: scope
code: |
  score = 0

  def add_point(score):
      score = score + 1
      return score

  add_point(score)
  print(score)
question: What does this print?
options:
  - text: "0"
    correct: true
    feedback: "The `score` inside `add_point` is the function's own. It becomes 1 and is handed back, but nothing keeps it. `score = add_point(score)` on line 7 would."
  - text: "1"
    misconception: local-changes-global
    feedback: "Inside the function, `score` is a separate variable that belongs to `add_point`. Changing it leaves the `score` outside at 0, and the 1 it returns isn't kept."
---
Two variables called `score`: one outside the function, and one in its brackets.
