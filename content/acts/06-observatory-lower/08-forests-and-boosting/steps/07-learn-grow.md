---
id: learn-grow
type: learn
title: Growing the tree
concept: decision-trees
code: |
  import numpy as np


  def gini(labels):
      shares = np.bincount(labels, minlength=2) / len(labels)
      return 1 - np.sum(shares ** 2)


  def best_threshold(x, y):
      best, best_score = None, gini(y)
      values = np.unique(x)
      for threshold in (values[:-1] + values[1:]) / 2:
          left = x <= threshold
          score = (left.sum() * gini(y[left]) + (~left).sum() * gini(y[~left])) / len(y)
          if score < best_score:
              best, best_score = float(threshold), score
      return best


  def build_tree(x, y, max_depth, depth=0):
      threshold = best_threshold(x, y) if depth < max_depth else None
      if threshold is None:
          return {"leaf": int(np.bincount(y).argmax())}
      left = x <= threshold
      return {"threshold": threshold,
              "left": build_tree(x[left], y[left], max_depth, depth + 1),
              "right": build_tree(x[~left], y[~left], max_depth, depth + 1)}


  ages = np.array([22, 25, 31, 40, 52, 60])
  repaid = np.array([0, 1, 1, 1, 1, 0])
  print(build_tree(ages, repaid, max_depth=1))
  print(build_tree(ages, repaid, max_depth=2))
---
A tree grows by asking the best question, then growing each side the same way. `build_tree` calls itself on the yes pile and the no pile, and tells each call it's one level deeper: `depth + 1`.

It stops and makes a leaf when the depth reaches `max_depth`, or when no question makes the pile purer. The leaf's answer is the commonest label in its pile: `np.bincount(y).argmax()`.

The example grows a tree on six applicants, one level deep, then two. The second level splits off the oldest.

A tree with no limit keeps asking until every pile is pure, and learns each applicant by heart. So choose `max_depth` on validation, like `k` and the degree.

The usual mistake is not passing the depth down. Every call then thinks it's at the top, and the tree never stops.
