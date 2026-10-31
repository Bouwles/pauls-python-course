---
id: investigate-sums
type: investigate
title: Poke at the sums
concept: arithmetic
code: |
  drink_price = 240
  drinks = 3
  cost = drink_price * drinks
  print(cost)
tasks:
  - id: run-it
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["720"]
    feedback: "720 pence. Three drinks at 240 each."
  - id: five-scones
    prompt: "Change `drinks` to 5 and run it. What is `cost` now?"
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
    prompt: "Set `drinks` back to 3. Try `print(cost // 100)`, then `print(cost % 100)`. Which one gives the pence left over: `//` or `%`?"
    kind: answer
    accept: ["%", "cost % 100", "percent", "the percent one", "modulo", "remainder"]
    feedback: "`%` gives the remainder: 720 % 100 is 20. `//` divides and throws the remainder away: 720 // 100 is 7. Seven pounds, twenty pence."
    wrong: "With `drinks = 3`, run both. One gives 7, the other 20."
---
This works in pence, the way a till does. Change things and watch what happens.

The names say what each value is. `drink_price` holds a price; `x` would hold anything.
