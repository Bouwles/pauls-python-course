---
id: learn-neuron
type: learn
title: One neuron
concept: perceptron
dialogue:
  - aaesha.neutral.point: "A brain cell adds up what reaches it, and fires if the total is high enough. This copies that."
code: |
  import numpy as np

  weights = np.array([-0.5, -0.2, -0.3])     # cloud, humidity, moon
  bias = 0.4

  for night in [[0.1, 0.5, 0.0], [0.9, 0.5, 1.0]]:
      total = np.dot(weights, night) + bias
      print(round(total, 2), 1 if total > 0 else 0)
---
A brain cell, a neuron, gets signals from many others. Some push it to fire, some hold it back. If the total is high enough, it fires.

An artificial neuron copies that. It multiplies each reading by a **weight**, adds them up, and adds a **bias**: `np.dot(weights, night) + bias`, the dot product from Act V. If the total is above 0 it says 1, otherwise 0. Frank Rosenblatt published it in 1958 as a model of how a brain might learn, and called it the **perceptron**.

Here the weights are negative: cloud, humidity and a bright moon all count against a stargazing night. The clear night totals `0.25` and says go ahead; the cloudy one totals `-0.45` and says no.

The usual mistake is reading a total of exactly 0 as yes. It has to be above 0.
