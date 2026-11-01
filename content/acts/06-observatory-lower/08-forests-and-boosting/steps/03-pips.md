---
id: pips
type: pips
title: Fix Riya's version
files: [loan_tree.py, tools.py]
entry: loan_tree.py
dialogue:
  - riya.pleased: "Can you look at mine? Max depth three, so it can't overfit. I learnt that one properly."
  - riya.worried: "A hundred and seventy-seven leaves. Right about every applicant it learnt from. That's suspicious."
dialogue_after:
  - riya.surprised: "Every call thought it was the first one. So the depth never got to three, and nothing ever stopped."
  - riya.laughing: "I'm drawing max_depth on the whiteboard. With an arrow, in three colours."
  - aaesha.neutral.point: "And a test that counts the leaves."
hints:
  nudge: "Each call of `build_tree` is one level further down than the call that made it. Where does it find out which level it's on?"
  plan:
    - Stop at max_depth, or when no question helps
    - Otherwise find the best question
    - Grow each side one level deeper
  shape: |
    "left": build_tree(X[left], y[left], max_depth, ___),
    "right": build_tree(X[~left], y[~left], max_depth, ___),
---
Riya's tree is a dictionary: a leaf is `{"leaf": 1}`, and a question is `{"feature": 0, "threshold": 1.5, "left": ..., "right": ...}`, where `left` is the yes side, itself a tree. `build_tree` calls itself to grow each side. Run it.

A depth of three allows at most eight leaves. To see why there are more, put `build_tree(X_train[:6], y_train[:6], max_depth=1)` on the line after `if __name__ == "__main__":` and press **Step through**. The visualiser stacks one block for each call still waiting for an answer. Watch how tall the stack gets, and what `depth` is in each block.

Then fix `build_tree`.
