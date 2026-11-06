---
id: predict-biggest
type: predict
title: Top score
concept: tracing-loops
code: |
  scores = [40, 75, 60]
  top = scores[0]
  for score in scores:
      if score > top:
          top = score
  print(top)
question: What does this print?
options:
  - text: "75"
    correct: true
    feedback: "`top` starts at 40, becomes 75, and stays there, because 60 isn't more than 75."
  - text: "60"
    misconception: loop-keeps-last-only
    feedback: "`top` only changes when a score beats it. 60 doesn't beat 75, so the `if` skips it and `top` stays at 75."
---
Three scores from the arcade cabinet.
