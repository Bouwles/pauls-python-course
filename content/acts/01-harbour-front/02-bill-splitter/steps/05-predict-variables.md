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
    feedback: "Line 2 moves the label. Python works out the right side first, `3 + 2`, then puts `drinks` on the answer."
  - text: "5"
    correct: true
    feedback: "Right. The right side is worked out first, using the old value, 3. Then the name moves to the new one, 5."
  - text: drinks
    misconception: printing-name-shows-name
    feedback: "There are no quotes round `drinks`, so Python looks up what the name holds. With quotes, `print(\"drinks\")` would print the word."
  - text: An error, because drinks can't equal drinks + 2
    misconception: assignment-is-equation
    feedback: "`=` isn't the equals of maths. It means: work out the right side, then put this name on the answer."
---
Two more people at the table want a drink. Follow the label on `drinks` from line 1 to line 3.
