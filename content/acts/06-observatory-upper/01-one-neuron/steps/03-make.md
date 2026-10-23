---
id: make
type: make
title: Penhallow's dome neuron
files: [neuron.py]
entry: neuron.py
on_pass: { wendt: "Clear tonight, it says. It's right. Well, it agrees with her, which I'll take." }
hints:
  nudge: "When the neuron is right, what is `error`, and what does adding `rate * error * night` do then?"
  plan:
    - "predict: weigh each reading, add them up, add the bias, and say 1 only if the total is above 0"
    - Start knowing nothing
    - Sweep through every example, at most `epochs` times
    - Ask the neuron
    - Nudge the weights by the error times the reading
    - Count the mistakes; stop after a clean sweep
  shape: |
    def predict(weights, bias, night):
        total = np.dot(___, ___) + bias
        return 1 if total ___ 0 else 0


    def train(nights, labels, rate, epochs):
        weights = np.zeros(___)
        bias = 0.0
        mistakes = []
        for epoch in range(epochs):
            wrong = 0
            for night, label in zip(nights, labels):
                error = label - ___
                weights = weights + ___
                bias = bias + ___
                if error != 0:
                    wrong += 1
            mistakes.append(wrong)
            if ___:
                break
        return weights, bias, mistakes
---
Build the neuron in `neuron.py`. Her log is in `nights.csv`: cloud, humidity, moon, then 1 if she opened the dome. The comments are Moss's subgoals from the varnish.

```
Learned in 8 epochs. Mistakes: 9, 5, 5, 4, 4, 4, 4, 0
Weights: cloud -0.38, humidity -0.22, moon -0.08, bias 0.30
Tonight: open the dome
```

`len(nights[0])` is how many readings a night has, so the same code works for two readings or ten.

The checks weigh nights by hand, train for one epoch on three nights and compare every number, then train on her whole log. They also try a rule it can't learn, to make sure it stops when the epochs run out.
