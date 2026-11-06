---
id: predict-height
type: predict
title: How many levels?
concept: trees
code: |
  class Card:
      def __init__(self, number, left=None, right=None):
          self.number = number
          self.left = left
          self.right = right


  def height(card):
      if card is None:
          return 0
      return 1 + max(height(card.left), height(card.right))


  root = Card(500, Card(250, Card(101, None, Card(188))), Card(750))
  print(height(root))
question: What does this print?
options:
  - text: "4"
    correct: true
    feedback: "Right. The deepest leaf is 188: 500, then 250, then 101, then 188, four levels. Each card is one more than its taller side."
  - text: "5"
    misconception: height-counts-cards
    feedback: "That's how many cards there are. Height counts levels down the longest path, and 750 is on a shorter one."
  - text: "3"
    misconception: height-counts-links
    feedback: "That counts the links between cards on the longest path. Here height counts the cards on it: a single card is 1."
---
`max` picks the bigger of two numbers. The 101 has a card on its right, 188, and nothing on its left.
