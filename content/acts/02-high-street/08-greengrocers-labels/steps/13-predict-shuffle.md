---
id: predict-shuffle
type: predict
title: What shuffle hands back
concept: random-module
code: |
  import random

  questions = ["food", "games", "music"]
  order = random.shuffle(questions)
  print(order)
  print(len(questions))
question: What does this print?
options:
  - text: |-
      None
      3
    correct: true
    feedback: "`random.shuffle` shuffles the list you give it, where it stands, and hands back `None`. The shuffled questions are still in `questions`."
  - text: The three questions in a new order, then 3
    misconception: shuffle-returns-list
    feedback: "That's what it looks as if it should do. But `shuffle` changes the list itself and returns `None`, so `order` holds nothing. Use `questions` afterwards."
  - text: |-
      ['food', 'games', 'music']
      3
    misconception: shuffle-works-on-copy
    feedback: "`shuffle` doesn't make a shuffled copy to keep. It rearranges the very list it's given, and returns `None`."
---
This time the program keeps what `shuffle` hands back.
