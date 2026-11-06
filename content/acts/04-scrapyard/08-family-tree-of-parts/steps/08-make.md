---
id: make
type: make
title: Make the catalogue
files: [catalogue.py]
entry: catalogue.py
on_pass: { neil.proud.thumbs: "Fifteen cards, five levels, and the recovery section without a single wasted look." }
hints:
  nudge: "For a tree that's empty, what's the answer? For any other, how does the answer come from the card and the answers for its two sides?"
  plan:
    - "Card: each card knows its own thing and the two cards below it"
    - "add: an empty tree: the new card is the root"
    - "Walk down from the root: already filed? Replace the name"
    - "Smaller goes left, bigger goes right, until a place is empty"
    - "find: the same walk, counting every look"
    - "Helpers that take a card: an empty side is the base case. In order is left side, the card, then the right side; height is one more than the taller side"
    - "between: in order, keeping the pairs in range; skip a side that can't hold any"
  shape: |
    def _height(card):
        if card is None:
            return ___
        return 1 + max(___, ___)


    def _in_order(card, pairs):
        if card is None:
            return
        _in_order(___, pairs)
        pairs.append((card.number, card.name))
        _in_order(___, pairs)


    def find(self, number):
        card = self.root
        while card is not None:
            self.looks = ___
            if number == card.number:
                return ___
            card = card.left if number ___ card.number else card.right
        return None
---
Neil's cards are in `catalogue.py`, in the order he filed them. Write `Card` and `Catalogue` above them, then a main block that files them and prints what the brief shows:

```
Catalogue: 15 cards, 5 levels
Card 342: parachute, in 3 looks
```

It's Paul's index with numbers and names. Pre-order and post-order are in-order with the `append` moved, as in "Three ways to copy it out". Helpers that take a card can sit outside the class, or inside with a leading underscore.

`between` can be `in_order` with a filter. For a better one, don't go down a side that can't hold anything in range: nothing left of a card numbered below `low`.

The hidden checks use an empty catalogue, a single card, repeated and negative numbers, a thousand cards filed at random, and two hundred filed in order, which makes a stick. They count every look `find` takes.
