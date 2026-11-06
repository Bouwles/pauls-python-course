---
id: predict-tree
type: predict
title: Follow the questions
concept: decision-trees
code: |
  tree = {"feature": 1, "threshold": 5000,
          "left": {"leaf": "approve"},
          "right": {"feature": 0, "threshold": 2.5,
                    "left": {"leaf": "decline"},
                    "right": {"leaf": "approve"}}}


  def decide(tree, row):
      if "leaf" in tree:
          return tree["leaf"]
      if row[tree["feature"]] <= tree["threshold"]:
          return decide(tree["left"], row)
      return decide(tree["right"], row)


  print(decide(tree, [2, 8000]), decide(tree, [2, 3000]))
question: What does this print?
options:
  - text: "decline approve"
    correct: true
    feedback: "Right. 8000 is more than 5000, so the first applicant goes right, then 2 is at most 2.5, so left: decline. The second asks for 3000, goes left at once, and is approved."
  - text: "approve decline"
    misconception: tree-sides-swapped
    feedback: "The yes side, where the reading is at most the threshold, is `left`. 8000 isn't at most 5000, so the first applicant goes right."
  - text: "approve approve"
    misconception: tree-asks-only-top
    feedback: "The first applicant goes right, and the right side is a whole question of its own. `decide` keeps asking until it reaches a leaf."
---
A different small tree. Column 0 is the checking account, column 1 the amount. Follow each applicant down from the top.
