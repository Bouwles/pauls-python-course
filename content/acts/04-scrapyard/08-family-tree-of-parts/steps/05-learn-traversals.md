---
id: learn-traversals
type: learn
title: Three ways to copy it out
concept: traversals
code: |
  class Card:
      def __init__(self, number, left=None, right=None):
          self.number = number
          self.left = left
          self.right = right


  def in_order(card, numbers):
      if card is None:
          return
      in_order(card.left, numbers)
      numbers.append(card.number)
      in_order(card.right, numbers)


  root = Card(500, Card(250, Card(101), Card(342)), Card(750, None, Card(977)))
  numbers = []
  in_order(root, numbers)
  print(numbers)
---
A **traversal** visits every card in a tree once. The three usual ones are the same recursion, and differ only in when each card is written down:

- **pre-order**: the card, then its left side, then its right side
- **in-order**: the left side, then the card, then the right side
- **post-order**: the left side, the right side, then the card

In a binary search tree, in-order gives the numbers smallest first, because everything smaller is on the left. Pre-order puts each card before the cards below it, so adding cards back in that order builds the same tree again.

The example walks in order and prints `[101, 250, 342, 500, 750, 977]`.

The usual slip is to expect a walk to go level by level. It goes all the way down a left side first.
