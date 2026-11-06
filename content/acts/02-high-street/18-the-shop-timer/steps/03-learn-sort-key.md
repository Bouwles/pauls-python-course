---
id: learn-sort-key
type: learn
title: Sorting by what matters
concept: sort-key
code: |
  def price(item):
      return item[1]


  stock = [("figs", 3.20), ("leeks", 0.90), ("plums", 2.10)]
  print(sorted(stock))
  print(sorted(stock, key=price))
  print(sorted(stock, key=price, reverse=True))
---
`sorted` normally compares the items themselves. Tuples are compared part by part, so a list of names and prices comes out in name order.

`key=price` hands `sorted` a function. It calls `price` on every item and sorts by what comes back, but it still hands back the whole items. `reverse=True` puts the biggest first. Caitlin's report wants the slowest calls first: the till's log, sorted by seconds.

The example prints the stock in name order, then cheapest first, then dearest first.

The usual slip is `key=price()`, with brackets. That calls `price` straight away, with no item, and fails. Pass the function, don't call it.
