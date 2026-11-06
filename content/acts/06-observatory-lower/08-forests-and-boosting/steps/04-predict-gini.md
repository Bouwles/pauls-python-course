---
id: predict-gini
type: predict
title: How mixed is a pile
concept: decision-trees
code: |
  def gini(labels):
      repaid = sum(labels) / len(labels)
      return 1 - repaid ** 2 - (1 - repaid) ** 2


  print(gini([1, 1, 0, 0]), gini([1, 1, 1, 1]), round(gini([1, 0, 0, 0]), 3))
question: "What does this print, for a half-and-half pile, a pile that all repaid, and a pile where one in four repaid?"
options:
  - text: "0.5 1.0 0.25"
    misconception: gini-is-share
    feedback: "That's the share who repaid in each pile. Gini measures how mixed the pile is, so a pile that all repaid, which isn't mixed at all, scores 0."
  - text: "0.5 0.0 0.25"
    misconception: gini-is-minority-share
    feedback: "Close, but Gini isn't the share of the rarer kind. It's the chance that two applicants drawn from the pile, with replacement, disagree: 1 - 0.25² - 0.75² = 0.375."
  - text: "0.5 0.0 0.375"
    correct: true
    feedback: "Right. Half and half is as mixed as two kinds get, 0.5. All one kind is 0. One in four sits between, at 0.375."
after: |
  Run it, then try `gini([1, 1, 1, 0, 0, 0, 0, 0])`.
---
The same idea, written another way: for two kinds, 1 minus the share who repaid squared, minus the share who didn't squared. Three piles, one after another.
