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
Write the pieces of the brief in `dqn.py`. `track.py` is Paul's racing grid, with `step` and `average_return`. `new_params`, `gradients` (Riya's, fixed) and `greedy` are already written.

- `features` and `q_values`: the tile in, four Q-values out, for every row of `X` at once.
- `ReplayBuffer`: add, count, and sample without replacement; past capacity, the oldest goes.
- `targets` and `train_step`: the frozen copy's targets, then one gradient step on the batch.
- `epsilon_at` and `copy_params`: the schedule, and a real copy.
- `train`: Paul's loop, with the network.

An `action` is a number from 0 to 3: its place in `ACTIONS`, and its column in the output.

Done, it prints the network's line, worth about 1 a race, against about -9 at random. The checks try each piece on Paul's numbers, then train 150 races with a seeded `rng`.

Train with `watch=True` to see the arrows settle.
