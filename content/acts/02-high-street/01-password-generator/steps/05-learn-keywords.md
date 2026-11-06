---
id: learn-keywords
type: learn
title: Arguments by name
concept: keyword-arguments
code: |
  def order(drink, sugar=0, milk=True):
      return f"{drink}, {sugar} sugar, milk {milk}"

  print(order("tea", milk=False))
  print(order("coffee", 2))
---
A call can name an argument: `milk=False`. That's a **keyword argument**. It goes to the parameter with that name, wherever that parameter sits in the `def` line.

When a function has several defaults, naming lets you change one and keep the rest. Caitlin can ask for `symbols=True` without typing out a length first.

Arguments without names are **positional**: they fill the parameters from the left, in order. In a call, positional arguments come first and keyword ones after.

The example's first call names only `milk`, so `sugar` keeps its 0. It prints `tea, 0 sugar, milk False`, then `coffee, 2 sugar, milk True`.

The usual slip is to think a named argument fills the next parameter in line. Its name decides where it goes.
