---
id: learn-rnn-step
type: learn
title: One step of the tide network
concept: rnns
code: |
  import numpy as np

  params = {"Wx": np.array([1.0, -0.5]),            # the reading's weight, for each of 2 neurons
            "Wh": np.array([[0.5, 0.0], [0.2, 0.5]]),   # the old memory's weights
            "b": np.zeros(2),
            "Wy": np.array([1.0, -1.0]), "by": 0.0}

  h = np.zeros(2)                                   # an empty memory
  for x in [0.5, 1.0, -0.5]:                        # three readings, scaled
      h = np.tanh(x * params["Wx"] + h @ params["Wh"] + params["b"])
      guess = float(h @ params["Wy"] + params["by"])
      print(h.round(2), round(guess, 2))
---
Neil's tide network does the same with eight hidden neurons. Each hour, one step:

```text
h = np.tanh(x * Wx + h @ Wh + b)      the new memory
guess = h @ Wy + by                   the next reading
```

`x` is this hour's reading, and `Wx` its weight for each neuron. `h @ Wh` mixes the old memory: every neuron's memory feeds every other's. `tanh` squashes the result between -1 and 1, so the memory can't grow without limit. Then a guess is read off the new memory.

The guess made after reading hour 5 is a guess at hour 6. The example runs two neurons over three readings and prints the memory and the guess each step.

The usual mistake is marking a guess against the reading it was made from, not the next one.
