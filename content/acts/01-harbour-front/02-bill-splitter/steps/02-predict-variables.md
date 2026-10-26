---
id: predict-variables
type: predict
title: A label on a box
concept: variables
code: |
  scones = 3
  scones = scones + 2
  print(scones)
question: What does this print?
options:
  - text: "3"
    misconception: variable-keeps-first-value
    feedback: "The second line moves the label. Python works out the right side first, 3 + 2, then sticks `scones` on the result."
  - text: "5"
    correct: true
    feedback: "Right. The right side is worked out first, using the old value. Then the name points at the new one."
  - text: scones
    misconception: printing-name-shows-name
    feedback: "No quotes round `scones`, so Python looks up what the name holds. With quotes it would print the word."
  - text: An error, because scones can't equal scones + 2
    misconception: assignment-is-equation
    feedback: "`=` isn't the equals of maths. It means: work out the right side, then put this label on the answer."
---
A **variable** is a name for a value. `scones = 3` puts the label `scones` on the number 3. Think of a label stuck on a box.

Later lines can move the label to a different box. Two more bell-ringers want a scone.
