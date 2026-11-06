---
id: predict-both
type: predict
title: In both boxes
concept: set-operations
code: |
  found = {"umbrella", "glove", "scarf"}
  reported = {"glove", "bicycle bell", "scarf"}
  print(sorted(found & reported))
question: What does this print?
options:
  - text: "['glove', 'scarf']"
    correct: true
    feedback: "`&` keeps what's in both sets: handed in, and asked about. `sorted` puts them in alphabetical order."
  - text: "['bicycle bell', 'glove', 'scarf', 'umbrella']"
    misconception: ampersand-joins-sets
    feedback: "That's everything from either set, which is `found | reported`. `&` keeps only what they share."
  - text: "['umbrella']"
    misconception: ampersand-is-difference
    feedback: "That's what's in `found` and not in `reported`, which is `found - reported`. `&` keeps what they share."
---
Curly brackets with no colons make a set. `sorted` shows it as an alphabetical list.
