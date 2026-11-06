---
id: predict-verdict
type: predict
title: A move that cost a point
concept: actor-critic
code: |
  gamma = 0.9
  values = {"here": 2.0, "there": 4.0}     # the critic's opinion of two tiles

  reward = -1                              # every move costs a point
  error = reward + gamma * values["there"] - values["here"]
  print(round(error, 2), "likelier" if error > 0 else "less likely")
question: What does this print?
options:
  - text: "0.6 likelier"
    correct: true
    feedback: "Right. -1 + 0.9 × 4.0 - 2.0 = 0.6. It paid a point and landed somewhere the critic rates well above where it was, so the move beat expectations."
  - text: "-1 less likely"
    misconception: advantage-is-reward
    feedback: "The verdict isn't the reward on its own. It adds what the critic thinks of where the crab landed, discounted, and takes away what it thought of where the crab was."
  - text: "-3.0 less likely"
    misconception: td-ignores-next-value
    feedback: "That leaves out where the crab landed: -1 - 2.0. The tile it reached is worth 4.0 to the critic, and that counts, times gamma."
  - text: "1.0 likelier"
    misconception: discount-ignored
    feedback: "The value of where the crab landed comes one move later, so it's discounted: 0.9 × 4.0, not 4.0."
after: |
  A move that costs a point can still be a good move. The critic judges it against what it expected from that tile, not against nothing.
---
The crab moved from a tile the critic rates at 2.0 to one it rates at 4.0, and paid a point for the move. Work out the verdict, then which way the actor goes.
