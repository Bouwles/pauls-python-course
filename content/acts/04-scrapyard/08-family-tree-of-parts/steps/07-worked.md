---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.pleased.point: "The Workshop's index cards, filed as a tree this time. By subject, alphabetically."
code: |
  class Card:
      def __init__(self, subject):
          self.subject = subject
          self.left = None
          self.right = None


  class Index:
      """The Workshop's index cards, as a binary search tree by subject."""

      def __init__(self):
          self.root = None
          self.looks = 0

      def add(self, subject):
          if self.root is None:
              self.root = Card(subject)
              return
          card = self.root
          while True:
              if subject == card.subject:
                  return
              if subject < card.subject:
                  if card.left is None:
                      card.left = Card(subject)
                      return
                  card = card.left
              else:
                  if card.right is None:
                      card.right = Card(subject)
                      return
                  card = card.right

      def find(self, subject):
          card = self.root
          while card is not None:
              self.looks = self.looks + 1
              if subject == card.subject:
                  return True
              card = card.left if subject < card.subject else card.right
          return False


  def in_order(card, subjects):
      if card is None:
          return
      in_order(card.left, subjects)
      subjects.append(card.subject)
      in_order(card.right, subjects)


  def height(card):
      if card is None:
          return 0
      return 1 + max(height(card.left), height(card.right))


  index = Index()
  for subject in ["Hashing", "Classes", "Recursion", "Arrays", "Files", "Sets", "Tuples"]:
      index.add(subject)
  print(index.find("Files"), index.looks, "looks")
  subjects = []
  in_order(index.root, subjects)
  print(subjects)
  print(height(index.root), "levels")
subgoals:
  - label: Each card knows its own thing and the two cards below it
    lines: [1, 5]
  - label: "An empty tree: the new card is the root"
    lines: [16, 18]
  - label: "Walk down from the root: already filed? Stop"
    lines: [19, 22]
  - label: Smaller goes left, bigger goes right, until a place is empty
    lines: [23, 32]
  - label: "Find: the same walk, counting every look"
    lines: [34, 41]
  - label: An empty side is the base case
    lines: [44, 46]
  - label: Left side, the card, then the right side
    lines: [47, 49]
  - label: One more than the taller side
    lines: [52, 55]
explain:
  prompt: "Paul filed `Hashing` first. Why does that make a better tree than filing `Arrays` first?"
  answer: "The first card is the root. Hashing comes near the middle of the alphabet, so about half the subjects go each side. Arrays comes first alphabetically, so every other card would go down its right side, and the tree would be a level taller for nothing."
  concept: binary-search-trees
---
Paul's index has what your catalogue needs: a card class, a walk down to add, the same walk to find, and two recursive helpers that take a card. Subjects compare alphabetically, as numbers compare by size.

The labels beside the code are the steps he took. Your catalogue takes the same steps with numbers and names, and they're in your file as comments. Your `add` replaces the name where his stops.
