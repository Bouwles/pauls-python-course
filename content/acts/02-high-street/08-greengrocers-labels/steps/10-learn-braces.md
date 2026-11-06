---
id: learn-braces
type: learn
title: Sets and dictionaries in one line
concept: dict-set-comprehensions
code: |
  snacks = ["crisps", "cake", "crisps", "fruit"]
  to_buy = {snack for snack in snacks}
  print(sorted(to_buy))

  how_many = {snack: snacks.count(snack) for snack in to_buy}
  print(how_many["crisps"])
---
Swap the square brackets for curly ones and a comprehension builds a set instead of a list: `{snack for snack in snacks}`. As with any set, repeats vanish.

Put `key: value` before the `for` and it builds a dictionary: `{snack: snacks.count(snack) for snack in to_buy}`. The part before the colon is each key, and the part after is its value.

Caitlin wants each round's name once, then how many questions each round has. That's a set, then a dictionary.

The example prints `['cake', 'crisps', 'fruit']`, then `2`.

The usual slip is with repeated keys. A dictionary keeps each key once, so if a key comes up twice, the later value replaces the earlier one.
