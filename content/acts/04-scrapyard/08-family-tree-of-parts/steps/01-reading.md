---
id: reading
type: learn
title: The family tree
concept: trees
code: |
  class Card:
      def __init__(self, number, left=None, right=None):
          self.number = number
          self.left = left
          self.right = right


  def count(card):
      if card is None:
          return 0
      return 1 + count(card.left) + count(card.right)


  root = Card(500, Card(250), Card(750))
  print(count(root))
---
A **tree** is a card with cards below it, and those have cards below them. The top card is the **root**. A card with nothing below it is a **leaf**. The **height** is how many levels there are, from the root down to the deepest leaf.

In Neil's catalogue each card has at most two cards just below it, `left` and `right`, and either can be `None`.

Every side of a tree is a smaller tree, so tree code is usually recursive, like the folders in the file tree printer. An empty side, `None`, is the base case.

The example counts a three-card tree: an empty side counts 0, and a card counts 1 plus both its sides. It prints `3`.

The usual slip is to forget the empty sides. A leaf still has two, both `None`.
