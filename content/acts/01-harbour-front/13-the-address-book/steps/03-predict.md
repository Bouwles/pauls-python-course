---
id: predict-loop
type: predict
title: Going through the book
concept: dict-items
code: |
  parcels = {"Bea": 2, "Tom": 1}
  for name in parcels:
      print(name)
question: What does this print?
options:
  - text: |-
      2
      1
    misconception: dict-loop-gives-values
    feedback: "Looping over a dictionary gives you the keys, not the values."
  - text: |-
      Bea 2
      Tom 1
    misconception: dict-loop-gives-pairs
    feedback: "A plain loop gives one thing each time: the key. For both, you ask for `.items()`."
  - text: |-
      Bea
      Tom
    correct: true
    feedback: "Right. Just the keys, in the order they went in."
after: |
  Run it. Then change line 2 to `for name, count in parcels.items():` and print both.
---
A `for` loop works on a dictionary too. Decide what it hands you each time round.
