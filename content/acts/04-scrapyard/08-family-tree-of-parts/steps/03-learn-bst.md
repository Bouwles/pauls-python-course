---
id: learn-bst
type: learn
title: Smaller left, bigger right
concept: binary-search-trees
code: |
  class Card:
      def __init__(self, number, left=None, right=None):
          self.number = number
          self.left = left
          self.right = right


  root = Card(500, Card(250, Card(101), Card(342)), Card(750, None, Card(977)))

  card = root
  while card is not None and card.number != 342:
      print("Look at", card.number)
      if 342 < card.number:
          card = card.left
      else:
          card = card.right
  print("Found", card.number)
---
A **binary search tree** keeps one rule at every card: everything down its left side has a smaller number, and everything down its right side a bigger one.

```text
              500
            /     \
         250       750
        /   \         \
     101     342       977
```

To find 342: smaller than 500, go left; bigger than 250, go right; there. Each look rules out a whole side, as binary search did on the bolt drawers. Adding a card is the same walk until it steps onto a `None`: the new card goes there. The example prints `Look at 500`, `Look at 250`, `Found 342`.

A well-jumbled tree is about log n levels high, so finding is O(log n). The usual slip is filing cards in number order. Each goes right of the last, and the tree is a stick n levels high.
