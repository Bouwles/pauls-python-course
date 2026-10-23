---
id: make
type: make
title: Make Sanjay's labels
on_pass: { sanjay: "Kale, a hundred and fifty pence. Not fifteen. The kale man will be relieved." }
hints:
  nudge: "Which of the three keeps every item, and which keep only some? That decides where each `if` goes."
  plan:
    - "A value for every item: if-else at the front"
    - "Only some items: if at the end, and curly brackets for a set"
    - "key: value for a dictionary, only for items in the shop"
    - "Doing, not building: a plain loop for the printing"
    - Sort the reorder set before joining it
  shape: |
    def labels(stock):
        return [
            f"{name.upper()} {price}p" ___ count > 0 ___ f"{name.upper()} sold out"
            for name, price, count in stock
        ]


    def reorder(stock):
        return {name for name, price, count in stock ___ count < 10}


    def price_book(stock):
        return {___: ___ for name, price, count in stock if count > 0}


    for label in labels(stock):
        print(label)
    print("Reorder:", ", ".join(___(reorder(stock))))
---
Write Sanjay's three functions, each with one comprehension, then print his Monday:

```
APPLES 45p
PEARS 60p
LEEKS sold out
PLUMS 25p
KALE 150p
Reorder: kale, leeks, pears
```

The labels keep every item, in order. The reorder set and the price book keep only some. The checks try other stock lists too, including an empty one.
