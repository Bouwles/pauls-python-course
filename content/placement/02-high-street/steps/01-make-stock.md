---
id: make-stock
type: make
title: Riya's reorder list
files: [stock.py, main.py]
entry: main.py
dialogue:
  - riya: "The market stall I'm helping wants a reorder list. Their stock file has typos. Plums cost nought point six oh."
on_pass: { riya: "Beetroot, carrots, pears. And it skipped the typos instead of ordering two damsons." }
---
The stall's stock list is `stock.csv`: a header, then one `item,price,count` line per item. Some lines have typos.

```text
item,price,count
apples,0.40,120
pears,0.55,8
leeks,0.90,15
plums,0.6O,30
```

In `stock.py`:

1. `read_stock(path)` gives back `rows, bad_lines`: a dictionary for every line that reads, like `{"item": "leeks", "price": 0.9, "count": 15}`, and the line numbers of the ones that don't. The header is line 1.
2. `to_reorder(rows, below=10)` gives back the items with fewer than `below` left, in alphabetical order.
3. `price_book(rows)` gives back a dictionary of item to price.

`to_reorder` and `price_book` are a comprehension each. Imported, `stock.py` prints nothing.

`main.py` imports them, prints the skipped lines if there are any, then what to order (or `Reorder: nothing`), and writes `reorder.txt` afresh, one item a line. With no `stock.csv`, it prints `No stock.csv today.`

```
Skipped lines: 5, 6, 8
Reorder: beetroot, carrots, pears
```
