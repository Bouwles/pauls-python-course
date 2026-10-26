---
id: make
type: make
title: Make the catalogue
files: [catalogue.py]
entry: catalogue.py
on_pass: { nell: "Fifteen cards, five levels, and the brass section in one go. Penhallow would've nodded at that." }
hints:
  nudge: "For a tree that's empty, what's the answer? For any other, how does the answer come from the card and the answers for its two sides?"
  plan:
    - "Card: number, name, and left and right, which start as None"
    - "add: an empty catalogue's new card is the root; otherwise walk left or right until the place is empty, replacing the name if the number turns up"
    - "find: the same walk, adding one to looks for every card it looks at"
    - "len and height: an empty side is 0; a card is 1 more than its two sides added, or than the taller side"
    - "in_order, pre_order, post_order: a helper that visits the left side, the card and the right side, in the right order"
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
Penhallow's cards are in `catalogue.py`, in the order she filed them. Write `Card` and `Catalogue` above them, then a main block that files them and prints what the brief shows.

Each method is a small recursive helper that takes a card, or a walk down from the root. Helpers that take a card can sit outside the class, or inside with a leading underscore.

`between` can be `in_order` with a filter. For a better one, don't go down a side that can't hold anything in range: nothing left of a card numbered below `low`.

Add the cards and press Step through to watch each one find its place.

The hidden checks use an empty catalogue, a single card, repeated numbers, negative numbers, a thousand cards filed at random, and two hundred filed in order, which makes the tree a stick. They count every look `find` takes.
