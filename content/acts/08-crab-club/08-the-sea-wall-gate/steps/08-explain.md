---
id: explain
type: explain
title: Two flags, not one
dialogue:
  - yahya.unimpressed: "Finished is finished. Why does step need two words for the same thing?"
prompt: "The crab is on (1, 2) when a practice race hits its 100-move limit. Q-learning is about to update the move it just made. Should its target include `gamma` times the best Q-value on (1, 2), or not? What would go wrong if `step` returned a single `done`?"
answer: "It should. The race was stopped, not finished: (1, 2) is still worth what it's worth, and the time limit is the League's, not the grid's. Leaving the future out would teach the crab that (1, 2) is a dead end worth nothing after this step. Only when terminated, at the finish or the pool, is there truly nothing after. With a single done, a learner can't tell the two apart."
concept: gymnasium
---
Think about which of the two flags `over` should be in your Q-learning target, and what the tile at the move limit is still worth.
