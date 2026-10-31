---
id: predict-shuffle
type: predict
title: A different order every week
concept: random-module
code: |
  import random

  questions = ["science", "words", "music"]
  order = random.shuffle(questions)
  print(order)
  print(len(questions))
question: What does this print?
options:
  - text: |-
      None
      3
    correct: true
    feedback: "Right. `random.shuffle` shuffles the list you give it, where it stands, and hands back `None`. The shuffled questions are still in `questions`."
  - text: The three questions in a new order, then 3
    misconception: shuffle-returns-list
    feedback: "That's what it looks as if it should do. But `shuffle` changes the list itself and returns `None`, so `order` holds nothing. Use `questions` afterwards."
  - text: |-
      ['science', 'words', 'music']
      3
    misconception: shuffle-works-on-copy
    feedback: "`shuffle` doesn't make a copy. It rearranges the very list it's given, and returns `None`."
---
Caitlin wants the questions in a different order every week, so nobody can learn them. `random.shuffle(things)` puts a list in a random order.

Read it carefully, then lock in your answer.
