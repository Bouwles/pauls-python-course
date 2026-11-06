---
id: worked
type: worked
title: How Paul would do it
language: text
dialogue:
  - paul.neutral.point: "Neil ran this on his laptop. The telescope's focus line, from his time trial. I've seen it work, so I'll allow it."
code: |
  import numpy as np
  import torch
  from torch import nn

  readings = np.loadtxt("focus.csv", delimiter=",", skiprows=1)
  temperature = torch.tensor(readings[:, 1:2], dtype=torch.float32)   # (30, 1)
  focus = torch.tensor(readings[:, 2:3], dtype=torch.float32)         # (30, 1)


  class FocusLine(nn.Module):
      def __init__(self):
          super().__init__()
          self.line = nn.Linear(1, 1)            # one weight, one bias

      def forward(self, x):
          return self.line(x)


  torch.manual_seed(0)
  model = FocusLine()
  loss_fn = nn.MSELoss()
  optimiser = torch.optim.Adam(model.parameters(), lr=0.1)

  for step in range(2000):
      optimiser.zero_grad()                      # gradients add up: start from 0
      loss = loss_fn(model(temperature), focus)
      loss.backward()                            # the tiny engine, industrial size
      optimiser.step()

  with torch.no_grad():
      print(f"focus = {model.line.weight.item():.4f} * temperature + {model.line.bias.item():.3f}")
      print(f"At 4.0 degrees: {model(torch.tensor([[4.0]])).item():.2f} mm")

  # What it printed on Neil's laptop:
  # focus = -0.1211 * temperature + 42.318
  # At 4.0 degrees: 41.83 mm
subgoals:
  - label: Numbers into tensors
    lines: [5, 7]
  - label: "The model: layers in __init__, the route in forward"
    lines: [10, 16]
  - label: Loss and optimiser
    lines: [19, 22]
  - label: "The loop: zero, forward, loss, backward, step"
    lines: [24, 28]
  - label: Ask it, without building a graph
    lines: [30, 32]
explain:
  prompt: "Take out `optimiser.zero_grad()`. The loop still runs. Why does it stop finding the line?"
  answer: "loss.backward() adds to each .grad, as the tiny engine did with +=. Without zeroing, every step's gradient is the sum of every gradient so far, so the steps point wherever the early, steep slopes pointed and the line never settles."
  concept: pytorch
---
The telescope's focus line from the Optimiser Benchmark, in PyTorch: the same line the formula gives, `-0.1211 * temperature + 42.318`. This code runs at home, not here, so what it printed on Neil's laptop is at the bottom.

`readings[:, 1:2]` keeps the column as (30, 1) rather than (30,): a layer wants a row per example, even with one reading in it.

The labels beside the code are Paul's steps, and the comments in your `reader.py` are the same ones.
