---
id: reading-block
type: reading
title: One block
dialogue:
  - neil: "Under the heads, two lines. I boxed them and wrote: one block. Stack them."
code: |
  X = X + multi_head(layer_norm(X, ln1_gain, ln1_shift), heads, Wo)
  X = X + feed_forward(layer_norm(X, ln2_gain, ln2_shift), W1, b1, W2, b2)
---
A **transformer** is a stack of blocks like this one. Each block does two things.

First, multi-head attention: the characters look at each other. Then a **feed-forward** network: the network from Neural Network from Scratch, a ReLU layer and a layer after it, used on each character's row on its own. Attention gathers; the feed-forward network thinks about what was gathered.

Before each, **layer norm**: batch norm turned round. Each row, one character, is brought to mean 0 and spread 1, then scaled by a gain and shifted. It needs no batch, so one character works fine.

After each, the result is added to what came in, the `X = X +`: a **residual connection**. Blame flows straight back along it, through a deep stack.

Attention alone doesn't know order, so each character starts with a **position embedding** added to its own: `E[id] + P[position]`.
