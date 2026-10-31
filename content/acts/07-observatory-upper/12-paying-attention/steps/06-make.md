---
id: make
type: make
title: Everyone asks at once
files: [attention.py]
entry: attention.py
on_pass: { aaesha: "Every row adds up to one, and nothing looks ahead. That's Neil's blackboard, running." }
hints:
  nudge: "In `attention`, which line turns the loops of Paul's version into one matrix product, and where does the mask go: before softmax or after?"
  plan:
    - "softmax: subtract each row's largest, exp, divide by the row's total"
    - "causal_mask: True above the diagonal"
    - "Score: every query against every key"
    - "Hide what a query mustn't see"
    - Softmax the scores into weights, one row per query
    - Mix the values by the weights
    - "self_attention: queries, keys and values from X, then attention"
  shape: |
    def causal_mask(n):
        return np.triu(np.ones((n, n), dtype=bool), k=___)


    def attention(Q, K, V, mask=None):
        scores = Q @ ___ / np.sqrt(K.shape[-1])
        if mask is not None:
            scores = np.where(mask, ___, scores)
        weights = softmax(scores)
        return ___, weights


    def self_attention(X, Wq, Wk, Wv, causal=True):
        Q, K, V = X @ Wq, ___, ___
        mask = causal_mask(len(X)) if causal else None
        return attention(Q, K, V, mask)
---
Write `softmax`, `causal_mask`, `attention` and `self_attention` in `attention.py`. The comments in `attention` are the subgoals from the full stop in "fog.".

In **self-attention**, the queries, keys and values all come from the same characters: `X @ Wq`, `X @ Wk` and `X @ Wv`, one row per character.

```
Weights, one row per character:
[[1.   0.   0.   0.  ]
 [0.67 0.33 0.   0.  ]
 [0.29 0.29 0.42 0.  ]
 [0.25 0.25 0.3  0.21]]
Rows add up to: [1. 1. 1. 1.]
```

The first character can only look at itself. Each later one spreads its attention over itself and everything before.

The checks compare your functions with a reference, value by value, on several sizes, and change the last character to make sure nothing earlier notices.
