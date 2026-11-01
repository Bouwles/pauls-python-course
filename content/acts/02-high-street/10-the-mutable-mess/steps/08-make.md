---
id: make
type: make
title: Make Saturday's orders
files: [orders.py]
entry: orders.py
on_pass: { caitlin.laughing: "Six buns for Paul this week, four in the standing book. Both right." }
hints:
  nudge: "If you copy only the outer dictionary, whose inner dictionaries are the extras added to?"
  plan:
    - Copy before you change, all the way down
    - For each customer with extras, find or make their order in the copy
    - Add each extra to that order
    - Hand back the copy
  shape: |
    def saturday_orders(standing, extras):
        orders = copy.___(standing)
        for customer, items in extras.items():
            if customer not in orders:
                orders[customer] = ___
            for item, quantity in items.items():
                orders[customer][item] = orders[customer].get(item, ___) + quantity
        return ___
---
The bake sale's standing orders live in `STANDING`, one dictionary per customer. Write `saturday_orders(standing, extras)`. It returns this Saturday's orders: every standing order with that customer's extras added, plus anyone who only ordered extras. It changes neither argument.

```
Paul {'bread': 3, 'buns': 6}
The Studio {'bread': 6, 'brownies': 2}
Yahya {'brownies': 1}
Standing: {'Paul': {'bread': 3, 'buns': 4}, ...}
```

The checks change Saturday's orders after you've made them, then look for the change in the standing book, using `is` as well as `==`.
