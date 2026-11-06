---
id: make-neuron
type: make
title: A neuron on cards
files: [engine.py, neuron.py]
entry: neuron.py
starter_from: make
on_pass: { aaesha.pleased: "Point nine. Clear, dry, a thin moon. Neil's already carrying the telescope up." }
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
Build a sigmoid neuron in `neuron.py` on your engine, which is in the first tab. The stargazing log is in `nights.csv`.

`Neuron(n_inputs)` starts knowing nothing, every weight a `Value` of 0. Called on a night's readings, it weighs them, adds the bias and squashes the total with the sigmoid. `train` walks downhill: each step, every gradient back to 0, then the mean squared error over every night, `backward()`, and every parameter moved against its gradient.

```text
Loss: 0.2500 at the start, 0.0476 at the end
Agrees with 24 of 24 nights
Tonight: 0.90, go ahead
```

Every night's loss is a graph reaching back to the weights, and one `backward()` fills in every gradient. To watch, add `draw_graph(loss)` (from `drawing`) after the first step's `backward()`.

The checks follow every number through a few steps, and train on the whole log.
