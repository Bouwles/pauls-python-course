---
id: block
type: make
title: One block of her machine
files: [attention.py, block.py]
entry: block.py
starter_from: make
on_pass: { wendt: "The block matches, number for number. And changing the last letter changes only the last row." }
hints:
  nudge: "Which way does layer norm take its mean, compared with batch norm? And in `transformer_block`, what gets added to what?"
  plan:
    - "multi_head: each head's self-attention output, side by side, then through Wo"
    - "layer_norm: each row's mean and variance, then gain and shift"
    - "feed_forward: a ReLU layer, then a second layer"
    - "Normalise, attend, and add it back on"
    - "Normalise, think about each character on its own, and add that back on"
  shape: |
    def multi_head(X, heads, Wo, causal=True):
        outputs = [self_attention(X, Wq, Wk, Wv, causal)[___] for Wq, Wk, Wv in heads]
        return np.concatenate(outputs, axis=___) @ Wo


    def layer_norm(X, gain, shift, eps=1e-5):
        mean = X.mean(axis=___, keepdims=True)
        var = X.var(axis=___, keepdims=True)
        return gain * (X - mean) / np.sqrt(var + eps) + shift


    def transformer_block(X, params):
        X = X + multi_head(layer_norm(X, ___, ___), params["heads"], params["Wo"])
        return X + ___
---
Write `multi_head`, `layer_norm`, `feed_forward` and `transformer_block` in `block.py`. Your `attention.py` comes with you. `load_block` reads one block's weights from `block_weights.json`, with `params["heads"]` as a list of `(Wq, Wk, Wv)` for each head.

```
In: (9, 8)  Out: (9, 8)
Where the full stop looks, in the first head:
  't' 0.06  'h' 0.01  'e' 0.35  ' ' 0.07  'h' 0.01  'i' 0.43  'l' 0.03  'l' 0.01  '.' 0.02
Changing the last character changes only the last row: True
```

These weights have never been trained. Wendt generated them to check the arithmetic, so the full stop's interest in vowels means nothing at all.

The checks compare each function with a reference on her weights and on other sizes.
