---
id: make
type: make
title: Make Deep Q
files: [track.py, dqn.py]
entry: dqn.py
timeout_ms: 20000
on_pass: { neil.proud.thumbs: "A network instead of a table, and its line still beats the traditional one. That's Deep Q." }
hints:
  nudge: "Before `train_step` can call `gradients`, it needs three things from the batch: features, actions and targets. Which of your functions gives each?"
  plan:
    - "features: a 1 for the row, a 1 for the column"
    - "q_values: the hidden layer with ReLU, then four outputs"
    - "ReplayBuffer: a list, the oldest dropped past capacity, rng.choice without replacement to sample"
    - "targets: the reward, plus gamma times the frozen copy's best Q-value after, times (1 - over)"
    - "train_step: arrays from the batch, targets, gradients, one step on every weight"
    - "epsilon_at, and copy_params with a .copy() of every array"
    - "train: explore less as it learns, remember every move, a batch at random, refresh the frozen copy"
  shape: |
    def targets(target_params, rewards, X_after, overs, gamma=0.9):
        best_after = q_values(___, X_after).max(axis=___)
        return rewards + gamma * best_after * ___


    def train_step(params, target_params, batch, gamma=0.9, rate=0.05):
        X = np.array([features(tile) for tile, _, _, _, _ in batch])
        actions = np.array([action for _, action, _, _, _ in batch])
        ...
        y = targets(___, rewards, X_after, overs, gamma)
        loss, grads = gradients(___, X, actions, y)
        for name in params:
            params[name] -= ___
        return loss
---
Write `dqn.py`. `track.py` is Paul's racing grid, now with `step` for racing and `average_return` for judging. `new_params`, `gradients` (Riya's, fixed) and `greedy` are already written.

A memory is `(tile, action, reward, after, over)`. `action` is a number from 0 to 3: its place in `ACTIONS`, and its column in the network's output.

Train with `watch=True` and press Run: after every race the output panel draws each tile's best Q-value and its arrow, and pointing at a tile shows all four. Watch the arrows settle as epsilon falls. The checks ignore drawings.

The checks try each piece on Paul's numbers, then train for 150 races with a seeded `rng` and work out exactly what the network's line is worth.
