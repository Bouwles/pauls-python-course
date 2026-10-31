---
id: predict-variables
type: predict
title: A label on a box
concept: variables
code: |
  drinks = 3
  drinks = drinks + 2
  print(drinks)
question: What does this print?
options:
  - text: "3"
    misconception: variable-keeps-first-value
    feedback: "The second line moves the label. Python works out the right side first, 3 + 2, then sticks `drinks` on the result."
  - text: "5"
    correct: true
    feedback: "Right. The right side is worked out first, using the old value. Then the name points at the new one."
  - text: drinks
    misconception: printing-name-shows-name
    feedback: "No quotes round `drinks`, so Python looks up what the name holds. With quotes it would print the word."
  - text: An error, because drinks can't equal drinks + 2
    misconception: assignment-is-equation
    feedback: "`=` isn't the equals of maths. It means: work out the right side, then put this label on the answer."
---
A **variable** is a name for a value. `drinks = 3` puts the label `drinks` on the number 3. Think of a label stuck on a box.

Later lines can move the label to a different box. Two more people at the table want a drink.
