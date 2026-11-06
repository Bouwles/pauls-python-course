---
id: learn-loop
type: learn
title: Zero, forward, loss, backward, step
concept: pytorch
code: |
  # The five steps of a PyTorch training loop, with one weight in plain Python
  w, grad = 0.0, 0.0
  x, target = 2.0, 6.0
  for step in range(20):
      grad = 0.0                          # optimiser.zero_grad()
      guess = w * x                       # model(X)
      loss = (guess - target) ** 2        # loss_fn(guess, target)
      grad += 2 * (guess - target) * x    # loss.backward(), which adds to .grad
      w -= 0.05 * grad                    # optimiser.step()
  print(round(w, 3), round(loss, 6))
---
Every PyTorch training step is the same five lines, the steps you wrote by hand in the Optimiser Benchmark:

```python
optimiser.zero_grad()                 # gradients add up: start from 0
loss = loss_fn(model(X_batch), labels_batch)
loss.backward()
optimiser.step()
```

`torch.optim.Adam(model.parameters(), lr=0.01)` is your `Adam`, and `nn.CrossEntropyLoss()` is your softmax and cross-entropy together. The example plays the same five steps with one plain number, and finds `w = 3.0`.

To ask a trained network something, wrap it in `with torch.no_grad():`, so nothing is recorded for a backward that never comes.

The usual mistake is ending `forward` with a softmax. `nn.CrossEntropyLoss` does its own, so it wants the raw scores.
