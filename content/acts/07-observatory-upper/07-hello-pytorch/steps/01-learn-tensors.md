---
id: learn-tensors
type: learn
title: Tensors remember too
concept: pytorch
dialogue:
  - neil.thinking: "So it's our engine, made big. I'd like to know what it does that we didn't."
---
**PyTorch** is the library most people train networks with. It's everything you've built in this room, made big and fast, and it runs on your own computer, not in the Workshop.

Its arrays are **tensors**. A tensor is a NumPy array that can also remember how it was made, like your `Value`. Make one with `requires_grad=True`, and every sum it's part of records its parents. `loss.backward()` walks them backwards and fills in each tensor's `.grad`:

```python
import torch

w = torch.tensor(3.0, requires_grad=True)
loss = (w * 2 - 4) ** 2
loss.backward()
print(loss.item(), w.grad)
```

At home that prints `4.0 tensor(8.)`. `.item()` turns a one-number tensor into a plain float.

The usual mistake is forgetting `.grad` adds up, exactly as on the cards.
