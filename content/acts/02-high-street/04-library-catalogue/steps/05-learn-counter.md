---
id: learn-counter
type: learn
title: Counting for you
concept: counter
code: |
  from collections import Counter

  orders = ["tea", "coffee", "tea", "hot chocolate", "tea", "coffee"]
  counts = Counter(orders)
  print(counts)
  print(counts["coffee"], counts["juice"])
  print(counts.most_common(1))
---
`Counter`, from the `collections` module, counts a list for you. It gives back a kind of dictionary: each different item, with how many times it turned up.

Aaesha has been using tally marks.

`from collections import Counter` brings in just `Counter`, so you write `Counter(...)` rather than `collections.Counter(...)`. Something it never saw counts as 0, not a KeyError. `.most_common(2)` gives the two commonest as a list of `(item, count)` tuples, commonest first. Items with the same count stay in the order they first turned up.

The example prints the counts, then `2 0`, then `[('tea', 3)]`.

The usual slip is to give it a whole string. It counts the letters. Split the text into words first.
