---
id: lstm
type: modify
title: Penhallow's sluice
files: [lstm.py]
entry: lstm.py
on_pass: { wendt: "Forty-eight quiet hours, and the cell still holds most of it. The plain memory holds nothing." }
hints:
  nudge: "There are four gates, and each is a weighted sum like the plain step. Which ones are squashed by sigmoid, and which by tanh?"
  plan:
    - All four gates at once, then split them
    - Sigmoid for forget, input and output; tanh for the candidate
    - Keep some of the old cell, let some of the new in
    - Show some of the cell as the hidden state
  shape: |
    def lstm_step(x, h, c, params):
        z = x * params["W"] + h @ ___ + params["b"]
        forget, inp, out, candidate = np.split(z, ___)
        forget, inp, out = sigmoid(forget), sigmoid(inp), sigmoid(out)
        candidate = ___
        c = forget * c + ___
        h = out * ___
        return h, c
---
Write `lstm_step(x, h, c, params)` in `lstm.py`. It's the plain step with four weighted sums instead of one, one per gate. `W`, `U` and `b` hold all four side by side, so one line makes them all and `np.split(z, 4)` cuts them apart, in this order: forget, input, output, candidate.

```python
c = forget * c + inp * candidate     # keep some, add some
h = out * np.tanh(c)                 # show some
```

The program at the bottom holds the forget gate open and the input gate shut for 48 quiet hours, and compares the cell with a plain memory.

There are no trained LSTM weights in her notebook. Training one is for your own computer, in the stretch.
