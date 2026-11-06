---
id: predict-zip
type: predict
title: What zip hands over
concept: zip
code: |
  names = ["Jon", "Mae"]
  legs = [84, 74]
  for pair in zip(names, legs):
      print(pair)
question: What does this print?
options:
  - text: |-
      ('Jon', 'Mae')
      (84, 74)
    misconception: zip-keeps-lists-whole
    feedback: "`zip` pairs the items at the same position, one from each list. It never hands over a whole list at once."
  - text: |-
      ('Jon', 84)
      ('Mae', 74)
    correct: true
    feedback: "Each pair is a tuple, one item from each list. That's why `for name, leg in zip(names, legs):` can unpack it."
  - text: |-
      Jon
      Mae
      84
      74
    misconception: zip-joins-lists
    feedback: "`zip` doesn't put one list after the other. It pairs them up: first with first, second with second."
---
This loop doesn't unpack. Each `pair` is printed whole.
