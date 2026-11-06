---
id: learn-params
type: learn
title: Something to work on
concept: parameters
code: |
  def greet(name):
      print(f"Morning, {name}.")

  greet("Riya")
  greet("Neil")
---
A **parameter** is a name in the brackets of a `def`. Each call fills it with a value, so the function can work on something different each time.

`greet("Riya")` runs `greet` with `name` holding `"Riya"`. The example prints `Morning, Riya.`, then `Morning, Neil.`

A function can have several parameters, with commas between them. The values in the call fill them in order, first to first: with `def cost(coffees, price):`, the call `cost(4, 3.5)` makes `coffees` 4 and `price` 3.5.

The usual slip is to think the names in the call have to match the parameters. They don't. Only the order counts.
