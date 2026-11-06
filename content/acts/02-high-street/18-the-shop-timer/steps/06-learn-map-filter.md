---
id: learn-map-filter
type: learn
title: Keep some, change each
concept: map-filter
code: |
  prices = [3.20, 0.90, 2.10]
  cheap = filter(lambda price: price < 3, prices)
  print(list(cheap))

  in_pence = map(lambda price: round(price * 100), prices)
  print(list(in_pence))
---
`filter(f, items)` keeps the items where the function `f` says yes, `True`. `map(f, items)` gives back `f` of each item.

Caitlin's report wants only the calls slower than a limit. That's a filter.

Both are lazy, like the generators in Neil's log streamer: they work each value out only as something asks for it. To see them all at once, wrap them in `list()`. The example prints `[0.9, 2.1]`, then `[320, 90, 210]`.

A list comprehension does the same jobs: `[price for price in prices if price < 3]`. Use whichever reads more easily.

The usual slip is to expect `filter` to throw away the items its function says yes to. It keeps them.
