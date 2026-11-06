---
id: predict-precedence
type: predict
title: Which sum first?
concept: operator-precedence
code: |
  print(4 + 2 * 3)
question: "What does this print?"
options:
  - text: "18"
    misconception: left-to-right-always
    feedback: "That's `4 + 2` first, then times 3. Python doesn't go left to right: `*` comes before `+`. So it's `2 * 3`, which is 6, then add the 4."
  - text: "10"
    correct: true
    feedback: "Right. `*` before `+`, so `2 * 3` is 6, then 4 more makes 10. To add first, you'd write `(4 + 2) * 3`."
  - text: "4 + 2 * 3"
    misconception: print-shows-code
    feedback: "There are no quotes, so this isn't a string. Python works the sum out and prints the answer."
---
Caitlin's table had one bowl of chips at 4 and two drinks at 3, written here as one sum. Work it out in Python's order before you pick.
