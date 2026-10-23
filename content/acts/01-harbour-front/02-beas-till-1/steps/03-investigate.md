---
id: investigate
type: investigate
title: Poke at the sums
concept: arithmetic
code: |
  bread_price = 240
  loaves = 3
  cost = bread_price * loaves
  print(cost)
tasks:
  - id: run-it
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["720"]
    feedback: "720 pence. Three loaves at 240 each."
  - id: five-loaves
    prompt: "Change `loaves` to 5 and run it. What is `cost` now?"
    kind: answer
    accept: ["1200"]
    feedback: "1200. You changed one line and the sum followed. That's what the variable is for."
  - id: divide
    prompt: "Change the last line to `print(cost / 100)`. What does it print?"
    kind: answer
    accept: ["12.0"]
    feedback: "12.0. Dividing with `/` always gives a number with a decimal point, called a float, even when it divides exactly."
    wrong: "Copy exactly what appears in the output, decimal point included."
  - id: remainder
    prompt: "Now try `print(cost // 100)` and then `print(cost % 100)` with `loaves = 3`. Which one gives the pence left over: `//` or `%`?"
    kind: answer
    accept: ["%", "cost % 100", "percent", "the percent one", "modulo", "remainder"]
    feedback: "`%` gives the remainder: 720 % 100 is 20. `//` divides and throws the remainder away: 720 // 100 is 7. Seven pounds, twenty pence."
    wrong: "Set `loaves` back to 3 and run both. One gives 7, the other 20."
---
Bea's till works in pence. Here is part of it. Change things and watch what happens.
