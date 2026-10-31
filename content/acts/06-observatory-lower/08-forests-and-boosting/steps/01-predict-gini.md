---
id: predict-gini
type: predict
title: How mixed is a pile
concept: decision-trees
dialogue:
  - paul: "Every question splits the applicants into two piles. A good question leaves each pile all one kind."
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
  Run it, then try `gini([1, 1, 1, 0, 0, 0, 0, 0])`. A tree goes looking for questions that turn mixed piles into piles near 0.
---
A **decision tree** decides with a chain of yes-or-no questions: is the applicant overdrawn? If yes, is the loan for under two years? Each answer leads to the next question, and the last one lands on an answer: approve, or decline.

To choose its questions, a tree needs to know how mixed a pile of applicants is. **Gini impurity** is one way: 1 minus the sum of each kind's share, squared.
