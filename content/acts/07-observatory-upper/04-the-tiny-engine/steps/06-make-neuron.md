---
id: make-neuron
type: make
title: A neuron on cards
files: [engine.py, neuron.py]
entry: neuron.py
starter_from: make
on_pass: { neil: "Point nine. Clear, dry, a thin moon. Aaesha's already carrying the telescope up." }
hints:
  nudge: "Training calls backward once a step, and gradients add up. What has to happen to every parameter's grad before each backward?"
  plan:
    - Start knowing nothing
    - Weigh each reading, add them up, add the bias
    - Squash it with the sigmoid
    - "For each step: every gradient back to 0"
    - The mean squared error over every night
    - backward, then move each parameter against its gradient
  shape: |
    def __call__(self, inputs):
        total = self.bias
        for weight, reading in zip(self.weights, inputs):
            total = total + ___
        return total.___()


    def train(neuron, nights, labels, rate, steps):
        losses = []
        for _ in range(steps):
            for parameter in neuron.parameters():
                parameter.grad = ___
            loss = sum((neuron(night) - label) ** 2 for night, label in zip(nights, labels)) / ___
            losses.append(loss.data)
            loss.___()
            for parameter in neuron.parameters():
                parameter.data -= ___
        return losses
---
The perceptron at the start of Neural Network from Scratch jumped from no to yes. A jump has no slope, so there was nothing for gradient descent to follow. Smooth the jump into a sigmoid and the engine can steer it.

Your engine is in the first tab. Build the neuron in `neuron.py`; the stargazing log is in `nights.csv`.

```
Loss: 0.2500 at the start, 0.0476 at the end
Agrees with 24 of 24 nights
Tonight: 0.90, go ahead
```

The weights are `Value`s, so every night's loss is a graph reaching back to them, and one `backward()` fills in every gradient. To watch, add `draw_graph(loss)` (from `drawing`) after the first step's `backward()`: one night's worth is plenty.

The checks follow every number through a few steps, and train on the whole log.
