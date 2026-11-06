---
id: predict-adam
type: predict
title: Adam's first step
concept: optimisers
code: |
  import numpy as np

  w = np.array([0.5, 0.5])
  g = np.array([4.0, -0.02])
  m, v = np.zeros(2), np.zeros(2)
  t = 1
  m = 0.9 * m + 0.1 * g
  v = 0.999 * v + 0.001 * g ** 2
  m_hat = m / (1 - 0.9 ** t)
  v_hat = v / (1 - 0.999 ** t)
  w = w - 0.01 * m_hat / (np.sqrt(v_hat) + 1e-8)
  print(w.round(4))
question: What does this print?
options:
  - text: "[0.49 0.51]"
    correct: true
    feedback: "Right. On the first step `m_hat` is the gradient and `v_hat` its square, so each weight moves by the rate, 0.01, against its own gradient's sign, however big or small that gradient is."
  - text: "[0.46   0.5002]"
    misconception: adam-step-scales-with-gradient
    feedback: "That's plain descent: the rate times each gradient. Adam divides by the square root of the gradient's square, so the size cancels and each weight moves by about the rate."
  - text: "[0.51 0.49]"
    misconception: step-along-gradient
    feedback: "Adam still walks downhill. The first gradient is positive, so its weight goes down, to 0.49; the second is negative, so its weight goes up."
---
One step of Adam, at a rate of 0.01, on two weights whose gradients are very different sizes and point opposite ways.
