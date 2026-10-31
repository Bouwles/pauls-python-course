---
id: predict-decay
type: predict
title: A weight nobody needs
concept: regularisation
dialogue:
  - neil: "My notebook says: shrink every weight a little, every step. I call it rent."
code: |
  w = 2.0                      # a weight on the moon
  rate, decay = 0.5, 0.2

  for step in range(3):
      gradient = 0.0           # the loss doesn't care about the moon
      gradient = gradient + decay * w
      w = w - rate * gradient

  print(round(w, 3))
question: "The loss doesn't depend on this weight at all. What does this print after three steps?"
options:
  - text: "1.458"
    correct: true
    feedback: "Right. Each step takes away `rate * decay * w`, a tenth of whatever is left: 2, 1.8, 1.62, 1.458. A weight that nothing defends shrinks towards 0."
  - text: "2.0"
    misconception: decay-needs-gradient
    feedback: "Without decay the weight would sit still. Weight decay adds `decay * w` to the gradient whatever the loss says, so even a weight nothing needs pays its rent."
  - text: "1.4"
    misconception: decay-subtracts-constant
    feedback: "The first step does take 0.2 off. But the second takes a share of 1.8, not of 2: the decay is proportional to the weight, so it takes less as the weight shrinks."
  - text: "0.0"
    misconception: decay-zeroes-weights
    feedback: "Weight decay shrinks weights; it doesn't switch them off. Each step takes a tenth of what's left, so the weight gets close to 0 without reaching it."
after: |
  Run it, then try 30 steps. Then set the gradient on line 5 to `0.5`, as if the loss needed this weight, and watch where it settles.
---
**Weight decay** adds `decay * W` to every weight's gradient before the step. So every weight shrinks a little each step, unless the loss pushes back hard enough to keep it.

That is what curbs Riya's network. Bending sharply through every noisy night takes big weights. With decay, only the weights that earn their keep stay big.

Biases are usually left out. They shift a neuron, rather than bend the curve.
