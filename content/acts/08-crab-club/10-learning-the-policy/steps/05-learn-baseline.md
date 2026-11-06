---
id: learn-baseline
type: learn
title: Better or worse than usual
concept: policy-gradients
code: |
  baseline = -5.0                  # what races from this tile are usually worth
  for ret in [-3.0, -5.0, -8.0]:
      score = ret - baseline
      print(ret, score, "more likely" if score > 0 else "less likely" if score < 0 else "no change")

  baseline += 0.1 * (-3.0 - baseline)    # nudge the baseline towards a new return
  print(baseline)
---
Every move costs -1, so nearly every return is negative, good races included. Plain REINFORCE makes even a good race's moves less likely, just less so than a bad race's.

A **baseline** asks the useful question: better or worse than usual from here? Take away what races from this tile are usually worth, and score the move by the difference. The example scores -3 as +2, more likely, and -8 as -3, less likely.

Taking the same number off every return leaves the nudges' long-run average alone, but each single nudge strays much less. To learn the baseline, nudge each tile's number 0.1 of the way towards every return that followed it: the example's ends at `-4.8`.

The usual mistake is a baseline far from the usual return.
