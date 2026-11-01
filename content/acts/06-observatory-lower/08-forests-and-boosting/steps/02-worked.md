---
id: worked
type: worked
title: How Paul would find one question
dialogue:
  - paul.neutral.point: "The open days again. Did the coffee run out by noon? One reading: visitors through the door."
  - caitlin.thinking: "Over a certain number and we're out by twelve. I just don't know the number."
code: |
  import numpy as np

  # Ten open days: visitors, and 1 if the coffee ran out by noon
  visitors = np.array([120, 150, 180, 220, 250, 290, 310, 350, 380, 400])
  sold_out = np.array([0, 0, 0, 0, 1, 0, 1, 1, 1, 1])


  def gini(labels):
      shares = np.bincount(labels) / len(labels)
      return 1 - np.sum(shares ** 2)


  best_threshold, best_score = None, gini(sold_out)
  values = np.unique(visitors)
  for threshold in (values[:-1] + values[1:]) / 2:
      yes = visitors <= threshold
      left, right = sold_out[yes], sold_out[~yes]
      score = (len(left) * gini(left) + len(right) * gini(right)) / len(sold_out)
      if score < best_score:
          best_threshold, best_score = threshold, score

  print(f"Before any question: Gini {gini(sold_out):.3f}")
  print(f"Best question: visitors <= {best_threshold:g}? Gini {best_score:.3f}")
subgoals:
  - label: The log
    lines: [3, 5]
  - label: How mixed is a pile
    lines: [8, 10]
  - label: Beat doing nothing
    lines: [13, 13]
  - label: Candidate thresholds, halfway between readings
    lines: [14, 15]
  - label: Split into yes and no
    lines: [16, 17]
  - label: Score each side, weighted by its size
    lines: [18, 18]
  - label: Keep the best
    lines: [19, 20]
  - label: Show the question
    lines: [22, 23]
explain:
  prompt: "Line 18 weights each side's Gini by how many Saturdays it holds. Why not simply add the two Ginis?"
  answer: "A side holding one Saturday always has a Gini of 0, so plain adding would favour questions that split off a single odd day. Weighting by size means a question only scores well if it sorts most of the Saturdays, not just one."
  concept: decision-trees
---
To find the best question about one reading, try every sensible threshold. The sensible ones sit halfway between neighbouring readings: anything else splits the days the same way as one of those.

For each threshold, the days with `visitors <= threshold` go to the yes pile and the rest to the no pile. The question's score is the two piles' Gini, each weighted by its share of the days. The lowest score wins, as long as it beats the pile before any question at all.

`np.unique` gives each distinct reading once, sorted; `values[:-1] + values[1:]` adds each to the next. A tree with several readings does this for every reading in turn, and keeps the best question of all.
