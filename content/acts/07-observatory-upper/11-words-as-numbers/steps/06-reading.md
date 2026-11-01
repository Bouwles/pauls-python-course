---
id: reading
type: reading
title: Learning what counting knew
dialogue:
  - neil.pleased: "The same model, but learnt. Downhill, like everything else in this room."
code: |
  X = one_hot(ids[:-1], size)          # every character but the last
  targets = ids[1:]                    # each one's next character

  embedded = X @ E                     # (n, dim): each character's embedding
  P = softmax(embedded @ W)            # (n, size): chances for the next one
  loss = -np.mean(np.log(P[rows, targets]))

  d_logits = P.copy()                  # backward: the chances...
  d_logits[rows, targets] -= 1         # ...minus the one-hot answers
  d_logits /= len(targets)
  d_W = embedded.T @ d_logits
  d_E = X.T @ (d_logits @ W.T)
---
Each character's embedding, a row of `E`, is multiplied by `W` to give a score for every possible next character. **Softmax** turns the scores into chances: `np.exp` of each, divided by their total.

The loss is the one you already compute, the average negative log likelihood, here called cross-entropy. For softmax and this loss together the backward pass starts very simply: the chances minus the one-hot answers. After that it's the blackboard: `.T` and `@`, shapes lined up.

`P[rows, targets]`, with `rows = np.arange(len(targets))`, picks each row's chance of its real next character.

`E` has only 8 columns, so the network can't learn a separate row for every pair as counting did. It has to find 8 numbers per character that do the job, and characters with similar company end up with similar rows.
