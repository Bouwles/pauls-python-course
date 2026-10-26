---
id: make
type: make
title: Training properly
files: [optimisers.py, brain.py]
entry: optimisers.py
timeout_ms: 20000
on_pass: { wendt: "Lamp at dusk, horn at the first fog, gate an hour before the spring tide. That's Tom's whole year." }
hints:
  nudge: "Momentum and Adam both need to remember something about each weight between one step and the next. Where can an object keep that?"
  plan:
    - "init_params: W1 first, then W2, each scaled to its inputs; every bias at 0"
    - A velocity for every weight, starting at 0
    - Keep most of the last step, add the new slope
    - Step by the velocity
    - "Adam: count the step, update both running averages, undo their slow start, step each weight by its own amount"
    - "train: for each epoch, for each batch, forward, backward, step; then note the loss on every row"
  shape: |
    def init_params(n_in, n_hidden, n_out, rng):
        W1 = rng.normal(0, np.sqrt(___), (n_in, n_hidden))
        W2 = rng.normal(0, np.sqrt(___), (n_hidden, n_out))
        return {"W1": W1, "b1": np.zeros(___), "W2": W2, "b2": np.zeros(___)}

    # Momentum.step
    for name in params:
        if name not in self.velocity:
            self.velocity[name] = np.zeros_like(params[name])
        self.velocity[name] = ___
        params[name] -= ___

    # train
    for _ in range(epochs):
        for X_batch, T_batch in batches(X, T, batch_size, rng):
            P, cache = forward(___, params)
            optimiser.step(params, backward(___, ___, params, cache))
        losses.append(loss(forward(___, params)[0], T))
---
Fill in `optimisers.py`. `SGD` is the pattern: an object with a `step(params, grads)` that moves every weight. The momentum comments are the subgoals from Moss's focus line; Adam's steps are in the reading.

```
sgd       loss 0.0468, every answer right on 89% of evenings
momentum  loss 0.0119, every answer right on 96% of evenings
adam      loss 0.0092, every answer right on 97% of evenings
From every weight at 0:
adam      loss 0.1756, every answer right on 40% of evenings
```

Why the square roots in `init_params`: a neuron adds up `n_in` products, and the spread of a sum grows like the square root of how many things are in it. Dividing by it keeps each layer's numbers about the same size, so no sigmoid starts out saturated. ReLU zeroes about half its inputs, so it gets twice as much: `2 / n_in`.

The checks follow every number through a few steps of each optimiser, and count `train`'s steps.
