---
id: learn
type: make
title: Downhill to the same place
files: [learn.py]
entry: learn.py
on_pass: { neil.surprised: "1.831 against counting's 1.849. And it put the 4 beside the 6, the 3 and the 5, unprompted." }
hints:
  nudge: "What shape is `X @ E`, and what shape must the scores be before softmax? Write the shape beside every line."
  plan:
    - Every character but the last, as one-hot rows; every character but the first, as targets
    - "Forward: look up each embedding, score every next character, softmax"
    - Note the loss before the step
    - "Backward: chances minus the answers, then back through W and E"
    - One step downhill
    - "nearest: make every embedding length 1, then compare with @"
  shape: |
    def softmax(logits):
        shifted = logits - logits.max(axis=1, keepdims=___)
        exps = np.exp(shifted)
        return exps / ___


    def nearest(E, vocab, char, count=3):
        unit = E / np.linalg.norm(E, axis=1, keepdims=True)
        similarity = unit @ unit[___]
        order = [i for i in np.argsort(-similarity) if vocab[i] != char]
        return [vocab[i] for i in order[:___]]
---
Write `one_hot`, `softmax`, `train` and `nearest` in `learn.py`. `load_forecasts` and `counting_loss` are Neil's. The forward and backward passes are the ones on the last page.

`train(ids, size, dim, rate, steps, seed=0)` starts `E` and `W` from `rng.normal(0, 0.1, ...)`, `E` first, with `rng = np.random.default_rng(seed)`. It notes the loss before each step.

```text
Step 0: loss 3.654
Step 100: loss 1.937
Step 200: loss 1.849
Step 300: loss 1.829
Step 399: loss 1.831
Counting gets 1.849 on the same forecasts
Nearest to '4': '6' '3' '5'
Nearest to '.': '9' ',' 'y'
```

`nearest` compares directions, as in "Which rows point alike". In `softmax`, subtract each row's largest score before `np.exp`, as for the digits.
