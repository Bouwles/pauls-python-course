---
id: side-by-side
type: reading
title: Your network, in PyTorch's words
dialogue:
  - paul.neutral: "Bought tools. Fine, once you know what they're doing for you."
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
Everything from the last three steps, as one table: what you built on the left, and PyTorch's name for it on the right. Keep it open while you work at home.
