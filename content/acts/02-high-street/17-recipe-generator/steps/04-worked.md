---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My stock book. Same shape as the machines log, only shorter."
code: |
  def read_stock(path):
      with open(path) as stock_book:
          for line in stock_book:
              line = line.strip()
              if not line or line.startswith("#"):
                  continue
              name, count = line.split(",")
              yield name, int(count)


  def running_low(items, limit):
      for name, count in items:
          if count < limit:
              yield name, count


  for name, count in running_low(read_stock("stock.txt"), 5):
      print(f"Order more {name}: {count} left")
subgoals:
  - label: Read the lines one at a time
    lines: [1, 3]
  - label: Skip the notes
    lines: [4, 6]
  - label: Turn each line into a tuple and hand it over
    lines: [7, 8]
  - label: Pass on only what's needed, as it's asked for
    lines: [11, 14]
  - label: Chain them, and loop over the end of the chain
    lines: [17, 18]
explain:
  prompt: "Moss never builds a list of the stock. Why would this still work if the stock book had a million lines?"
  answer: "Each generator asks the one before it for one item at a time, and the open file hands over one line at a time. Only one line is ever in hand, so the length of the book doesn't matter."
  concept: lazy-evaluation
---
An open file is an iterator too: a `for` loop over it gets one line at a time.

`read_stock` feeds `running_low`, which feeds the `for` loop. Each one only asks the one before it when it needs another item.

The labels are your subgoals for the log.
