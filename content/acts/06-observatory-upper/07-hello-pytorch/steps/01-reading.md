---
id: side-by-side
type: reading
title: Your brain, in PyTorch's words
dialogue:
  - wendt: "Everybody downstairs uses PyTorch. I'd like to know what it does that we didn't."
  - moss: "Bought tools. Fine, once you know what they're doing for you."
code: |
  # What you built                    PyTorch
  # NumPy array                        torch.tensor(..., dtype=torch.float32)
  # Value: a number with parents       a tensor made with requires_grad=True
  # loss.backward(), your engine       loss.backward(), its engine
  # params dict: W1, b1, W2, b2        an nn.Module, holding nn.Linear layers
  # forward(X, params)                 model(X), which calls model.forward(X)
  # init_params                        done for you when nn.Linear is made
  # W1 is (inputs, outputs)            layer.weight is (outputs, inputs)
  # Adam class with step()             torch.optim.Adam(model.parameters(), lr=0.01)
  # grads set back to 0                optimiser.zero_grad()
  # softmax, then cross_entropy        nn.CrossEntropyLoss(), given the raw scores
  # argmax(axis=1)                     argmax(dim=1)
  # float(x)                           x.item()
---
PyTorch is everything you've built upstairs, made big and fast. A **tensor** is a NumPy array that can also remember how it was made, like your `Value`. Give it `requires_grad=True` and every sum it's part of records its parents; `loss.backward()` walks them backwards and fills in each tensor's `.grad`.

An `nn.Module` is a brain as an object: layers made in `__init__`, the route through them in `forward`. Calling `model(X)` runs `forward`, and `model.parameters()` hands every weight to the optimiser.

Two traps. `nn.CrossEntropyLoss` does its own softmax, so `forward` stops at the raw scores. And gradients add up, exactly as on the cards, so each step starts with `optimiser.zero_grad()`.

To ask a trained brain something, wrap it in `with torch.no_grad():`. Nothing is recorded, so nothing is kept for a backward that never comes.
