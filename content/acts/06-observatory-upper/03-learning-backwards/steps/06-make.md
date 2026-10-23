---
id: make
type: make
title: Learning backwards
files: [backprop.py]
entry: backprop.py
on_pass: { wendt: "W1 ok, b1 ok, W2 ok, b2 ok. Arithmetic agrees with calculus. It usually does. I still check." }
hints:
  nudge: "Read the board from the bottom up. Which value's gradient do you know first, and which one does each line need from the line before?"
  plan:
    - Start at the loss
    - Back through the sigmoid
    - "Layer two: the weights' share, the bias's share, the blame for H"
    - Back through the relu
    - "Layer one: the weights' share and the bias's share"
    - "check_gradients: work out every gradient with backward, then measure each one by nudging, and compare"
    - "train: for each step, forward, note the loss, backward, and move every weight against its gradient"
  shape: |
    def backward(X, T, params, cache):
        Z1, H, P = cache["Z1"], cache["H"], cache["P"]
        dP = 2 * (P - T) / ___
        dZ2 = dP * ___
        dW2 = ___ @ dZ2
        db2 = dZ2.sum(axis=___)
        dH = dZ2 @ ___
        dZ1 = dH * ___
        dW1 = ___
        db1 = ___
        return {"W1": dW1, "b1": db1, "W2": dW2, "b2": db2}


    def check_gradients(X, T, params):
        P, cache = forward(X, params)
        grads = backward(X, T, params, cache)

        def current_loss():
            return loss(forward(X, ___)[0], T)

        return {name: bool(np.allclose(grads[name], numerical_gradient(current_loss, ___)))
                for name in params}


    def train(X, T, params, rate, steps):
        losses = []
        for _ in range(steps):
            P, cache = forward(X, params)
            losses.append(___)
            grads = backward(X, T, params, cache)
            for name in params:
                params[name] -= ___
        return losses
---
Write `backward`, `check_gradients` and `train` in `backprop.py`. The rules are the ones from the other half of the board, and the comments follow the subgoals from the paper version. `numerical_gradient` is Pip's, fixed.

```
W1: ok
b1: ok
W2: ok
b2: ok
Loss: 0.2181 at the start, 0.0003 at the end
Sails: [1 0 0 1]
```

`check_gradients` can hand `numerical_gradient` a little function that runs `forward` on `params` and returns the loss. The checker nudges the arrays inside `params` in place, so that function sees every nudge.

The checks compare your gradients with measured ones on brains of several sizes, including one with a neuron that never fires. They test `check_gradients` with a backward that is right and one that is wrong.
