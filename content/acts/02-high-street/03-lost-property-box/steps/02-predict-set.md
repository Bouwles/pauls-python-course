---
id: predict-set
type: predict
title: How many different things
concept: sets
code: |
  box = ["umbrella", "glove", "umbrella", "scarf", "glove", "umbrella"]
  print(len(set(box)))
question: What does this print?
options:
  - text: "6"
    misconception: set-keeps-duplicates
    feedback: "A set holds each value once. Six entries, but only three different things."
  - text: "3"
    correct: true
    feedback: "The set keeps one umbrella, one glove and one scarf. `len` counts what's in it, so 3."
  - text: "1"
    misconception: set-drops-repeated
    feedback: "A set doesn't throw out things that were repeated. It keeps exactly one of each, so the umbrella and the glove stay alongside the scarf."
---
Six things in Caitlin's box, written down as they were handed in.
