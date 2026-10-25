---
id: predict-gini
type: predict
title: How mixed is a pile
concept: decision-trees
dialogue:
  - moss: "Every question splits the nights into two piles. A good question leaves each pile all one kind."
code: |
  def gini(labels):
      dew = sum(labels) / len(labels)
      return 1 - dew ** 2 - (1 - dew) ** 2


  print(gini([1, 1, 0, 0]), gini([1, 1, 1, 1]), round(gini([1, 0, 0, 0]), 3))
question: "What does this print, for a half-and-half pile, an all-dew pile, and a pile with one dew night in four?"
options:
  - text: "0.5 1.0 0.25"
    misconception: gini-is-share
    feedback: "That's the share of dew nights in each pile. Gini measures how mixed the pile is, so an all-dew pile, which isn't mixed at all, scores 0."
  - text: "0.5 0.0 0.25"
    misconception: gini-is-minority-share
    feedback: "Close, but Gini isn't the share of the rarer kind. It's the chance that two nights drawn from the pile, with replacement, disagree: 1 - 0.25² - 0.75² = 0.375."
  - text: "0.5 0.0 0.375"
    correct: true
    feedback: "Right. Half and half is as mixed as two kinds get, 0.5. All one kind is 0. One in four sits between, at 0.375."
after: |
  Run it, then try `gini([1, 1, 1, 0, 0, 0, 0, 0])`. A tree goes looking for questions that turn mixed piles into piles near 0.
---
A **decision tree** forecasts with a chain of yes-or-no questions: is the spread under 2.45 degrees? If yes, is the sky under half cloudy? Each answer leads to the next question, and the last one lands on an answer.

To choose its questions, a tree needs to know how mixed a pile of nights is. **Gini impurity** is one way: 1 minus the sum of each kind's share, squared.
