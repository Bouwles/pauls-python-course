---
id: investigate-sums
type: investigate
title: Change the sums
concept: arithmetic
code: |
  drink_price = 240
  drinks = 3
  cost = drink_price * drinks
  print(cost)
tasks:
  - id: run-it
    prompt: "Press Run. What does it print?"
    kind: answer
    accept: ["720"]
    feedback: "720 pence: three drinks at 240 each. Line 3 used the values from lines 1 and 2."
  - id: five-scones
    prompt: "Change line 2 to `drinks = 5`. Press Run. What number appears?"
    kind: answer
    accept: ["1200"]
    feedback: "1200. You changed one line, and the sum on line 3 followed. That's what variables are for."
  - id: divide
    prompt: "Change line 4 to `print(cost / 100)`. Press Run. What does it print?"
    kind: answer
    accept: ["12.0"]
    feedback: "12.0, in pounds. `/` always gives a number with a decimal point, even when it divides exactly."
    wrong: "Copy exactly what appears in the output, decimal point included."
  - id: pounds-and-pence
    prompt: "Change line 4 to `print(cost // 100, cost % 100)`. Press Run. What does it print?"
    kind: answer
    accept: ["12 0"]
    feedback: "12 0: twelve whole pounds, and nothing left over. The comma in `print()` puts a space between the two numbers."
    wrong: "With `drinks = 5`, `cost` is 1200. Copy the whole line of output, both numbers."
  - id: remainder
    prompt: "Now change line 2 back to `drinks = 3`. Press Run. What does it print?"
    kind: answer
    accept: ["7 20"]
    feedback: "7 20: 720 pence is seven pounds and twenty pence. `//` gave the whole pounds, and `%` the pence left over."
    wrong: "Line 2 should say `drinks = 3` and line 4 `print(cost // 100, cost % 100)`. Copy the whole line of output."
  - id: bad-name
    prompt: "On line 3, change `cost` to `drink cost`, with a space. Press Run. What is the first word of the last red line in the Output panel?"
    kind: answer
    accept: ["SyntaxError", "syntaxerror", "Syntax Error", "SyntaxError:"]
    feedback: "SyntaxError. Python sees two names side by side, `drink` and `cost`, and can't make sense of them. A name can't have a space: `drink_cost` works."
    wrong: "Look at the red lines in the Output panel, above Neil's note. The last one starts with the kind of error, written as one word."
---
A small program that works in pence, the way a till does. Each task changes one line, so you can see what follows from it.
