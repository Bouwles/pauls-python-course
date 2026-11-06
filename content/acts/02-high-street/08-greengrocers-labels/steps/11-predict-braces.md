---
id: predict-braces
type: predict
title: The same key twice
concept: dict-set-comprehensions
code: |
  prices = [("cake", 2), ("crisps", 1), ("cake", 3)]
  menu = {name: price for name, price in prices}
  print(menu)
question: What does this print?
options:
  - text: "{'cake': 3, 'crisps': 1}"
    correct: true
    feedback: "Each key appears once. The second `cake` gives the key a new value, so the later price wins."
  - text: "{'cake': 2, 'crisps': 1}"
    misconception: dict-existing-key-ignored
    feedback: "A key that's already there isn't skipped. The second `cake` replaces its value, so it's 3."
  - text: "{'cake': 2, 'crisps': 1, 'cake': 3}"
    misconception: dict-comprehension-keeps-duplicates
    feedback: "A dictionary can't hold a key twice. The later `cake` replaces the earlier one."
---
The bake sale's price list has cake on it twice.
