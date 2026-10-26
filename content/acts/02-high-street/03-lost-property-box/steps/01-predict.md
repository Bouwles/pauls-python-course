---
id: predict-set
type: predict
title: One of each
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
    feedback: "Right. The set keeps one umbrella, one glove and one scarf."
  - text: "1"
    misconception: set-drops-repeated
    feedback: "A set doesn't throw out things that were repeated. It keeps exactly one of each, so the umbrella and the glove stay alongside the scarf."
after: |
  Run it. A set keeps one of each, and forgets the order they came in.
---
`set(box)` turns the list into a **set**, another kind of collection. Mrs Vance hopes it's the kind she likes.

Commit to an answer, then run it.
