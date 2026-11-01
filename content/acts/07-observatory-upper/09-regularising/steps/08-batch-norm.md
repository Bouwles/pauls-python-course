---
id: batch-norm
type: modify
title: Batch norm, properly
files: [batchnorm.py]
entry: batchnorm.py
on_pass: { neil.proud: "Metres and knots on the same scale. And one evening on its own still gets a real answer." }
hints:
  nudge: "At evaluation there may be only one evening. Where do the mean and variance come from then?"
  plan:
    - "Training: this batch's mean and variance, column by column"
    - "Fold them into the running numbers: momentum times the old, plus 1 - momentum times the new"
    - "Evaluation: use the running numbers, and leave them alone"
    - Normalise, then scale by gamma and shift by beta
  shape: |
    def batch_norm(Z, gamma, beta, running, training, momentum=0.9, eps=1e-5):
        if training:
            mean = Z.mean(axis=___)
            var = ___
            running["mean"] = momentum * running["mean"] + (1 - momentum) * ___
            running["var"] = ___
        else:
            mean = ___
            var = ___
        return gamma * ___ + beta
---
Write `batch_norm(Z, gamma, beta, running, training, momentum=0.9, eps=1e-5)` in `batchnorm.py`, starting from `standardise`.

In training it normalises with the batch's own mean and variance, then multiplies each column by `gamma` and adds `beta`. Those are two arrays the network learns, so it can undo the normalising wherever that helps.

It also keeps running averages in the dict `running`, updated in place:

```python
running["mean"] = momentum * running["mean"] + (1 - momentum) * mean
```

and the same for `"var"`. At evaluation it uses `running["mean"]` and `running["var"]` instead, and changes nothing.

Then change the program at the bottom to use it. Put tonight's evening, `[[800.0, 25.0]] @ W1`, through at evaluation.
