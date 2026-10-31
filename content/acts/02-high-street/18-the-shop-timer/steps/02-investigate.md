---
id: investigate
type: investigate
title: Sorting by what matters
concept: sort-key
code: |
  stock = [("figs", 3.20, 4), ("leeks", 0.90, 30),
           ("plums", 2.10, 12), ("kale", 1.50, 0)]

  print(sorted(stock))
  print(sorted(stock, key=lambda item: item[1]))

  in_stock = filter(lambda item: item[2] > 0, stock)
  names = map(lambda item: item[0], in_stock)
  print(list(names))
tasks:
  - id: plain-sort
    prompt: "Run it. With no `key`, which part of each tuple decides the order on the first line?"
    kind: answer
    accept: ["the name", "name", "names", "the names", "first", "the first", "the first item", "the first part", "item[0]", "by name", "alphabetical", "alphabetically"]
    feedback: "The name. Tuples are compared item by item, so the names decide, and the prices would only matter if two names matched."
  - id: cheapest
    prompt: "Which item comes first on the second line?"
    kind: answer
    accept: ["leeks"]
    feedback: "Leeks, at 90p. `sorted` calls the `key` function on every item and sorts by what comes back, the price, but it hands back the whole tuples."
  - id: missing
    prompt: "Which item is missing from the last line?"
    kind: answer
    accept: ["kale"]
    feedback: "Kale. `filter` keeps the items its function says yes to, and kale's count is 0. Then `map` turns each remaining tuple into its name."
  - id: most-first
    prompt: "Riya wants the names of what's in stock, most plentiful first. Change the program so its last line is `['leeks', 'plums', 'figs']`."
    kind: run
    tests: |
      TESTS = [
          output("Most plentiful first", expect="['leeks', 'plums', 'figs']", match="last_line",
                 hint="Sort what's in stock by item[2] before taking the names. reverse=True puts the biggest first."),
      ]
    solution: |
      stock = [("figs", 3.20, 4), ("leeks", 0.90, 30),
               ("plums", 2.10, 12), ("kale", 1.50, 0)]

      print(sorted(stock))
      print(sorted(stock, key=lambda item: item[1]))

      in_stock = filter(lambda item: item[2] > 0, stock)
      by_count = sorted(in_stock, key=lambda item: item[2], reverse=True)
      names = map(lambda item: item[0], by_count)
      print(list(names))
---
The stall's stock: name, price, how many.

`lambda item: item[1]` is a small function with no name. It takes `item` and gives back `item[1]`. It suits places where a function is needed for one line only, like `key=`.

`filter(f, items)` keeps the items where `f` says yes. `map(f, items)` gives back `f` of each one. Both are lazy, like the generators in Neil's log streamer, hence the `list()`.
