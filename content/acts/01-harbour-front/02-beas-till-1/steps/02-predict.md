---
id: predict-variables
type: predict
title: A label on a box
concept: variables
code: |
  loaves = 3
  loaves = loaves + 2
  print(loaves)
question: What does this print?
options:
  - text: "3"
    misconception: variable-keeps-first-value
    feedback: "The second line moves the label. Python works out the right side first, 3 + 2, then sticks `loaves` on the result."
  - text: "5"
    correct: true
    feedback: "Right. The right side is worked out first, using the old value. Then the name points at the new one."
  - text: loaves
    misconception: printing-name-shows-name
    feedback: "No quotes round `loaves`, so Python looks up what the name holds. With quotes it would print the word."
  - text: An error, because loaves can't equal loaves + 2
    misconception: assignment-is-equation
    feedback: "`=` isn't the equals of maths. It means: work out the right side, then put this label on the answer."
---
A **variable** is a name for a value. `loaves = 3` puts the label `loaves` on the number 3. Think of a label stuck on a box.

Later lines can move the label to a different box.
