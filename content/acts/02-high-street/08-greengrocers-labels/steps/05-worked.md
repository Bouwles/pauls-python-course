---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Snack orders for the end-of-term trip. Three things out of one list, then a plain loop to print."
code: |
  orders = [
      ("Aaesha", "crisps", 3),
      ("Yahya", "fruit", 6),
      ("Riya", "crisps", 1),
      ("Caitlin", "cake", 0),
  ]

  tickets = [
      f"{name}: {qty}" if qty > 0 else f"{name}: cancelled"
      for name, item, qty in orders
  ]
  buy = {item for name, item, qty in orders if qty > 0}
  qty_by_name = {name: qty for name, item, qty in orders if qty > 0}

  for ticket in tickets:
      print(ticket)
  print("Buy:", ", ".join(sorted(buy)))
  print("Yahya wants", qty_by_name["Yahya"])
subgoals:
  - label: "A value for every item: if-else at the front"
    lines: [8, 11]
  - label: "Only some items: if at the end, and curly brackets for a set"
    lines: [12, 12]
  - label: "key: value for a dictionary"
    lines: [13, 13]
  - label: "Doing, not building: a plain loop"
    lines: [15, 18]
explain:
  prompt: "Why are the tickets printed with a plain `for` loop, not a comprehension?"
  answer: "A comprehension is for building a list. Printing builds nothing: a comprehension there would make a list of `None`s nobody wants, and hide what the line is for."
  concept: list-comprehensions
---
Curly brackets make a set comprehension, so repeats vanish and `crisps` appears once. Curly brackets with `key: value` make a dictionary.

When a comprehension won't fit on one line, split it inside the brackets, as in lines 8 to 11. Any longer than that and Paul would write the loop instead.
