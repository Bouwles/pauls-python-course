---
id: make
type: make
title: Three ways to hold back
files: [net.py, regular.py]
entry: regular.py
on_pass: { aaesha: "Weight decay: 0.134 on the nights it never saw, against Riya's 0.246. That one I'll believe." }
hints:
  nudge: "Which of the three changes the forward pass, which changes the gradients, and which only watches?"
  plan:
    - "dropout_mask: one random number per entry; keep it if it's at least rate, and scale the keepers"
    - "with_weight_decay: a new dict, with decay times the weight added to each W's gradient"
    - One step downhill, with some of the hidden layer asleep
    - Score it, with every neuron awake, on both sets of nights
    - "A new best: note when, and keep a copy"
    - "Out of patience: stop"
    - Put the best weights back
  shape: |
    def dropout_mask(shape, rate, rng):
        return (rng.random(shape) >= ___) / ___


    def with_weight_decay(grads, params, decay):
        return {name: grad + ___ if name.startswith("W") else grad
                for name, grad in grads.items()}


    # inside train, each epoch:
        keep = dropout_mask((len(X), ___), drop, rng) if drop > 0 else None
        P, cache = forward(X, params, ___)
        grads = with_weight_decay(backward(X, T, params, cache), params, ___)
        for name in params:
            params[name] -= rate * grads[name]
        train_losses.append(mse(forward(X, params)[0], T))
        val_losses.append(___)
---
Write the two helpers and `train` in `regular.py`. The comments in `train` are the subgoals from the radiator. In `net.py`, `forward` takes a dropout mask as `keep` and keeps it in the cache, so `backward` uses the same one.

```
                      training  validation
Riya's                  0.0000      0.2455
weight decay 0.02       0.0451      0.1340
dropout 0.5             0.0106      0.1890
early stopping          0.0603      0.1842
Guessing the average                0.4213
```

Make one `rng = np.random.default_rng(seed)` before the first epoch, and draw a fresh mask from it every step, one row per night and one column per hidden neuron. Your dropout numbers may differ from these if you draw them another way. After each step, record both losses with no mask.

The checks compare your training with plain gradient descent, with decay on, and with patience, on networks of several sizes.
