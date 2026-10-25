---
id: predict
type: predict
title: Copying the tree out
concept: traversals
code: |
  class Card:
      def __init__(self, number, left=None, right=None):
          self.number = number
          self.left = left
          self.right = right


  def copy_out(card, numbers):
      if card is None:
          return
      numbers.append(card.number)
      copy_out(card.left, numbers)
      copy_out(card.right, numbers)


  root = Card(500, Card(250, Card(101), Card(342)), Card(750, None, Card(977)))
  numbers = []
  copy_out(root, numbers)
  print(numbers)
question: "The tree from the reading. What does this print?"
options:
  - text: "[500, 250, 101, 342, 750, 977]"
    correct: true
    feedback: "Right. Each card is written down first, then its whole left side, then its whole right side. The 750 has to wait until everything under 250 is done."
  - text: "[101, 250, 342, 500, 750, 977]"
    misconception: every-walk-is-sorted
    feedback: "That's the order you get when each card is written down between its two sides. Here it's written before either, so 500 comes first."
  - text: "[500, 250, 750, 101, 342, 977]"
    misconception: walk-goes-level-by-level
    feedback: "A recursive walk doesn't go level by level. `copy_out(card.left, numbers)` goes all the way down the left side before the right side starts."
after: |
  Run it. Then move the `append` line between the two recursive calls and predict again, then after both.
---
A **traversal** visits every card in a tree once. The three usual ones differ only in when a card is written down: before both its sides (**pre-order**), between them (**in-order**), or after both (**post-order**).

Press Step through: the junk tower shows which cards are waiting for their sides to finish.
