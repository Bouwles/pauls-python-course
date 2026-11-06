---
id: learn-gini
type: learn
title: How mixed is a pile?
concept: decision-trees
code: |
  def gini(labels):
      shares = [labels.count(label) / len(labels) for label in set(labels)]
      return 1 - sum(share ** 2 for share in shares)


  print(gini([1, 1, 1, 1]))
  print(gini([1, 1, 0, 0]))
  print(round(gini([1, 1, 1, 0]), 3))
---
Each question splits the applicants into two piles. A good question leaves each pile mostly one kind: mostly repaid, or mostly not. To choose questions, a tree needs a number for how mixed a pile is.

**Gini impurity** is that number. In words: for each kind, take its share of the pile and square it; add those up; take the total away from 1.

A pile all of one kind scores `0.0`. Half and half, the most mixed two kinds can be, scores `0.5`. Three of one and one of the other sits between, at `0.375`. Lower means purer.

The usual mistake is reading Gini as the share of one kind. It measures the mix, so a pile where everyone repaid scores 0, not 1.
