---
id: predict-two-ifs
type: predict
title: Two places for an if
concept: conditional-comprehensions
code: |
  scores = [7, 4, 0, 9]
  played = [score for score in scores if score > 0]
  marked = [score if score > 0 else "absent" for score in scores]
  print(len(played), len(marked))
question: What does this print?
options:
  - text: "3 4"
    correct: true
    feedback: "Right. The `if` at the end is a filter: the 0 is left out. The `if ... else` at the front keeps every item and chooses what to write for each."
  - text: "4 4"
    misconception: end-if-keeps-all
    feedback: "An `if` at the end decides which items get in at all. The 0 fails it, so `played` has three."
  - text: "3 3"
    misconception: front-if-filters
    feedback: "An `if ... else` at the front doesn't remove anything. It picks what to put in for every item, so `marked` keeps all four."
---
An `if` can go in two places in a comprehension, and the two places do different jobs.

Four teams' scores from last Thursday. The Lifeboat Crew didn't turn up. Work out how long each new list is.
