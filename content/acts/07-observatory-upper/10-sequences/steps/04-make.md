---
id: make
type: make
title: An hour ahead
files: [rnn.py]
entry: rnn.py
on_pass: { aaesha: "Under six centimetres, an hour ahead. That's an hour's warning for the river path." }
hints:
  nudge: "What does each step need from the step before it, and what does `forecast` use as a reading once the readings run out?"
  plan:
    - "step: mix the new reading with the memory, and squash; read the guess off the memory"
    - Start with an empty memory
    - "Each reading in turn: one step"
    - Keep every hidden state, and every guess
    - "forecast: read every reading, then feed each guess back in as if it were a reading"
  shape: |
    def step(x, h, params):
        h = np.tanh(x * params["Wx"] + h @ ___ + ___)
        guess = float(h @ ___ + params["by"])
        return h, guess


    def run(xs, params):
        h = np.zeros(___)
        hiddens, guesses = [], []
        for x in xs:
            h, guess = step(___, ___, params)
            ...
        return np.array(hiddens), np.array(guesses)


    def forecast(xs, params, hours):
        hiddens, guesses = run(xs, params)
        h, guess = hiddens[-1], guesses[-1]
        ahead = [guess]
        while len(ahead) < hours:
            h, guess = step(___, h, params)
            ahead.append(guess)
        return np.array(ahead)
---
Write `step`, `run` and `forecast` in `rnn.py`. The comments are the subgoals from the fog beacon. Each hour:

```python
h = np.tanh(x * Wx + h @ Wh + b)      # the new memory
guess = h @ Wy + by                   # the next reading, scaled
```

```
One hour ahead, over 287 hours:
  the network is out by 5.8 cm on average
  "same as last hour" is out by 46.7 cm
Next six hours: 4.01 4.27 4.16 3.72 2.99 2.16
```

`forecast` reads every reading, then keeps going on its own: each guess goes back in as the next hour's reading. Errors pile up that way, so the sixth hour is shakier than the first.

The checks use Neil's weights and a smaller network, and look ahead up to ten hours.
