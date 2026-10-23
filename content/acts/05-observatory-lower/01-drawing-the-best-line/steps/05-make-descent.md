---
id: make-descent
type: make
title: The best line, on foot
files: [line.py]
entry: line.py
starter_from: make-line
on_pass: { wendt: "The walker and the formula agree to four places. I didn't expect that to feel so satisfying." }
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
Now find the same line on foot. Add two functions to `line.py`:

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

Then put `TONIGHT = 4.0` near the top, and make the program print both lines and tonight's setting, as in the Ask. At a rate of 0.01, 2,000 steps land on the formula's line.

The hidden checks compare your slopes with slopes measured by nudging `w` and `b` a tiny amount, and make sure the loss falls at every step.

Two settings make a valley, not a hill, so `show_hill` can't draw this walk. To watch one setting on its own, fit only the slope of a line through the origin, as Moss did with the clock.
