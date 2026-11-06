---
id: predict-bst
type: predict
title: Where does the new card go?
concept: binary-search-trees
code: |
  class Card:
      def __init__(self, number, left=None, right=None):
          self.number = number
          self.left = left
          self.right = right


  def add(root, number):
      card = root
      while True:
          if number < card.number:
              if card.left is None:
                  card.left = Card(number)
                  return f"left of {card.number}"
              card = card.left
          else:
              if card.right is None:
                  card.right = Card(number)
                  return f"right of {card.number}"
              card = card.right


  root = Card(500, Card(250, Card(101), Card(342)), Card(750, None, Card(977)))
  print(add(root, 377))
  print(add(root, 600))
question: What does this print?
options:
  - text: |-
      right of 342
      left of 750
    correct: true
    feedback: "Right. 377 goes left at 500, right at 250, right at 342, and there's nothing there. 600 goes right at 500, then left at 750, into the empty place."
  - text: |-
      left of 500
      right of 500
    misconception: bst-stops-at-root
    feedback: "A new card doesn't stop beside the root. It walks down, left or right at every card, until it reaches an empty place."
  - text: |-
      right of 977
      right of 977
    misconception: bst-new-card-at-end
    feedback: "A tree has no end to tack cards onto. Each new card follows the rule from the root down: 377 is smaller than 500, so it goes left."
---
The same tree, and a walk that files a new card.
