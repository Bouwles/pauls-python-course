---
id: predict-precedence
type: predict
title: Which sum first?
concept: operator-precedence
code: |
  print(4 + 2 * 3)
question: "A pot of tea is 4 and a scone is 3. The table had one pot and two scones. What does this print?"
options:
  - text: "18"
    misconception: left-to-right-always
    feedback: "That's 4 + 2 first, then times 3. Python doesn't just go left to right: multiplication comes before addition, as in maths. 2 * 3 first, then add the 4."
  - text: "10"
    correct: true
    feedback: "Right. `*` before `+`, the same order you'd use on paper. One pot of tea and two scones come to 10."
  - text: "4 + 2 * 3"
    misconception: print-shows-code
    feedback: "There are no quotes, so this isn't text. Python works the sum out and prints the answer."
---
Without quotes, Python treats numbers as numbers and works the sum out before printing it.

`*` means times and `/` means divide. Most of a bill is those two and `+`.

Commit to an answer, then run it.
