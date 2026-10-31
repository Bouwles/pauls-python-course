---
id: make-descent
type: make
title: The best line, on foot
files: [house_prices.py]
entry: house_prices.py
starter_from: make-line
on_pass: { riya: "The walker and the formula agree to the cent. I didn't expect that to feel so satisfying." }
hints:
  nudge: "Which way should `w` move when `dw` is positive? And which loss goes into `losses` first?"
  plan:
    - Start from a guess
    - Take many steps
    - Measure the miss, and keep the loss
    - Find the slope of the loss
    - Step downhill
    - Hand back w, b and the losses
  shape: |
    def gradients(x, y, w, b):
        miss = predict(x, w, b) - ___
        dw = 2 * np.mean(miss * ___)
        db = 2 * np.mean(___)
        return dw, db


    def gradient_descent(x, y, rate, steps):
        w, b = ___, ___
        losses = []
        for step in range(steps):
            losses.append(mse(___, y))
            dw, db = gradients(x, y, w, b)
            w = w - ___ * dw
            b = ___
        return w, b, losses
---
Now find the same line on foot. Add two functions to `house_prices.py`:

```text
gradients(x, y, w, b)                (dw, db): the slope of the mean squared error
                                     in the w direction and in the b direction
gradient_descent(x, y, rate, steps)  start at w = 0, b = 0 and take that many
                                     steps; return (w, b, losses), where losses
                                     holds the loss from before each step
```

Two settings means two slopes, both from the chain rule:

```text
dw = 2 * mean((w * x + b - y) * x)
db = 2 * mean(w * x + b - y)
```

Walk with the areas in hundreds of square metres, at a rate of 0.1, for 2,000 steps. Then print `By descent:` under the formula's line, with `w` back in dollars per square metre, as in the Ask.

The hidden checks compare your slopes with slopes measured by nudging `w` and `b` a tiny amount, and make sure the loss falls at every step.
