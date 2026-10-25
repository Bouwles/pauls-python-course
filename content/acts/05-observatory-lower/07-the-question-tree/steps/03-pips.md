---
id: pips
type: pips
title: Pip's Version
files: [dew_tree.py, tools.py]
entry: dew_tree.py
dialogue:
  - pip: "Max depth three, so it can't overfit. I've learnt that one properly."
  - pip: "Thirty-one leaves. Right about every training night. Professor Wendt asked how a depth of three grows thirty-one leaves."
dialogue_after:
  - pip: "Every call thought it was the first one. So the depth never got to three, and nothing ever stopped."
  - pip: "I'm going to go and sit on the roof again."
  - moss: "Take a coat. It's going to dew."
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
Pip's tree is a dictionary: a leaf is `{"leaf": 1}`, and a question is `{"feature": 0, "threshold": 2.45, "left": ..., "right": ...}`, where `left` is the yes side, itself a tree. `build_tree` calls itself to grow each side. Run it.

A depth of three allows at most eight leaves. To see why there are more, put `build_tree(X_train[:6], dew_train[:6], max_depth=1)` on the line after `if __name__ == "__main__":` and press **Step through**. Nell's junk tower stacks one crate for each call still waiting for an answer. Watch how tall it gets, and what `depth` is in each crate.

Then fix `build_tree`.
