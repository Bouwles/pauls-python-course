---
id: learn-lambda
type: learn
title: A function on one line
concept: lambda
code: |
  stock = [("figs", 3.20), ("leeks", 0.90), ("plums", 2.10)]
  print(sorted(stock, key=lambda item: item[1]))

  double = lambda number: number * 2
  print(double(4))
---
`lambda item: item[1]` makes a small function with no name. Before the colon are its parameters, here `item`. After it is one expression, and its value is what comes back.

It's for places that need a function once, on one line, like `key=`. A whole `def price(item):` for one sort is a lot of ceremony.

There's no `return`: whatever comes after the colon is handed back. Nothing runs when a lambda is written, only when it's called. The example prints the stock cheapest first, then `8`.

If it needs a name, or more than one line, write a `def` instead.

The usual slip is to write `return` inside one. It's a SyntaxError.
