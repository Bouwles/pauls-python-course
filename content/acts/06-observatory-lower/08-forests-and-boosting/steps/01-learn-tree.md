---
id: learn-tree
type: learn
title: A chain of questions
concept: decision-trees
dialogue:
  - paul.neutral.wave: "A lender should be able to explain a no. Questions, written down, are an explanation."
code: |
  # A small tree, as nested dictionaries. Column 0 is checking, column 1 is months.
  tree = {"feature": 0, "threshold": 1.5,
          "left": {"feature": 1, "threshold": 22.5,
                   "left": {"leaf": "approve"},
                   "right": {"leaf": "decline"}},
          "right": {"leaf": "approve"}}


  def decide(tree, row):
      if "leaf" in tree:
          return tree["leaf"]
      if row[tree["feature"]] <= tree["threshold"]:
          return decide(tree["left"], row)
      return decide(tree["right"], row)


  print(decide(tree, [0, 12]))
  print(decide(tree, [0, 36]))
  print(decide(tree, [3, 36]))
---
A **decision tree** decides with a chain of yes-or-no questions, like a game of twenty questions. Is `checking` at most 1.5? If yes, is the loan for at most 22.5 months? Each answer leads to the next question, and the last lands on an answer, called a **leaf**: approve, or decline.

In Python a tree can be a dictionary. A question names a column, `feature`, and a `threshold`. Its `left` side is the yes answer and its `right` side the no, and each side is itself a tree.

`decide` starts at the top and follows the answers down. It calls itself on one side, the recursion from Act IV, until it reaches a leaf.

The usual mistake is mixing up the sides. Yes, `<=`, goes left.
