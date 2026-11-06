---
id: predict-policy
type: predict
title: After a slip
concept: mdps
code: |
  TRADITIONAL = {
      (0, 0): "right", (0, 1): "right", (0, 2): "right",
      (1, 0): "up", (1, 2): "up",
      (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",
  }
  tiles = [(2, 0), (1, 0), (0, 0)]   # the first step slipped up
  print([TRADITIONAL[tile] for tile in tiles])
question: What does this print?
options:
  - text: "['right', 'up', 'right']"
    correct: true
    feedback: "Right. The policy is asked again on every tile. On `(1, 0)` it says up, and along the top it says right. The crab has slipped onto a different line, and the rulebook copes."
  - text: "['right', 'right', 'right']"
    misconception: policy-is-a-route
    feedback: "That's following a plan made at the start, whatever happens. The list comprehension looks each tile up in the policy, and on `(1, 0)` the policy says up."
---
The crab raced the traditional line, but its first step slipped up the left side. `tiles` holds the tiles it stood on. What was it told on each?
