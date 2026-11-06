---
id: learn-records
type: learn
title: A list of records
concept: nested-data
code: |
  expenses = [
      {"item": "snacks", "category": "food", "amount": 18.4},
      {"item": "coach hire", "category": "travel", "amount": 212.0},
  ]
  expenses.append({"item": "fruit", "category": "food", "amount": 6.5})
  for expense in expenses:
      print(f"{expense['item']}: {expense['amount']:.2f} ({expense['category']})")
---
A list can hold dictionaries. Each receipt is one dictionary, a record with the same three keys, and the list keeps the records in the order they came in.

Riya's contact book looked records up by name. The trip fund doesn't need names: it needs every receipt, in order.

`.append()` adds a new record on the end. A `for` loop over the list hands you one whole dictionary each pass, and `expense['item']` reads inside it. The example prints a line for each of the three receipts, like `snacks: 18.40 (food)`.

The usual slip is to read `expense` as a position, 0, 1, 2. It's the dictionary itself.
