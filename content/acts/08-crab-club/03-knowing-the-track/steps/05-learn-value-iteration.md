---
id: learn-value-iteration
type: learn
title: The best a tile can be worth
concept: value-iteration
code: |
  values = {"A": 0.0, "B": 5.0, "C": -2.0}
  OUTCOMES = {
      "right": [(0.8, "B", -1), (0.1, "C", -1), (0.1, "A", -1)],
      "down": [(0.8, "C", -1), (0.1, "A", -1), (0.1, "B", -1)],
  }


  def q_value(action):
      return sum(chance * (reward + 0.9 * values[after]) for chance, after, reward in OUTCOMES[action])


  for action in OUTCOMES:
      print(action, round(q_value(action), 2))
  print(round(max(q_value(action) for action in OUTCOMES), 2))   # A's new value
  print(max(OUTCOMES, key=q_value))                              # A's best action
---
Policy evaluation says what one policy is worth. **Value iteration** finds the best any policy could do. It's the same sweep, but each tile takes the Q-value of its *best* action, the biggest of them, instead of the policy's. Sweep until nothing changes, as before.

Then read the best policy off the values: on each tile, the action with the biggest Q-value. Looking one step ahead like that is called acting **greedily** on the values. `max(OUTCOMES, key=q_value)` gives the action itself, not its Q-value.

The example prints each action's Q-value on tile A, then the best, `2.42`, and the best action, `right`.

The usual mistake is taking the biggest outcome too. You choose the action, so take its max. Chance chooses the outcome, so add the outcomes up, weighted by their chances.
