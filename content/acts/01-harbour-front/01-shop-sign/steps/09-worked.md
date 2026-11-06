---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "I made one for Neil's door last week. Same job as yours, smaller door."
code: |
  # Sign for the Puzzle Room door.
  # Neil wants it in this order: name, hours, invitation.

  print("THE PUZZLE ROOM, THIRD FLOOR")
  print("Help with bugs, 9 till 1")
  print('Bring the code you call "broken"')
subgoals:
  - label: Say what the program is for
    lines: [1, 2]
  - label: Print each line of the sign, top to bottom
    lines: [4, 5]
  - label: Use the other kind of quotes when the text contains quotes
    lines: [6, 6]
explain:
  prompt: "Why does line 6 use single quotes on the outside?"
  answer: "The text has double quotes in it, around \"broken\". If the outside quotes were double too, Python would think the string ended at the second one."
  concept: strings
---
A program like the one you're about to write: the sign on Neil's door. It uses only what you've just learned: comments, `print()` and strings.

The three labels beside the code are the steps Paul took. Your file for the Build starts with the same three steps, as comments. Look closely at line 6: its text has quote marks in it.
