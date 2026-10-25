---
id: make-baseline
type: make
title: The scores to beat
files: [notes.py, baseline.py]
entry: baseline.py
starter_from: make-notes
on_pass: { wendt: "Guessing evenly: 65. The bigram: 9.8. That's the bar. A low one, but a bar." }
hints:
  nudge: "A bigram looks one character back. Which column of `X` is the character just before each target?"
  plan:
    - "perplexity: e to the average of minus the log of each chance"
    - "bigram_probs: count each window's last character followed by its target"
    - Add the smoothing, then divide each row by its total
    - "bigram_chances: for each window, the chance its last character gives its target"
    - Print guessing evenly, then the bigram on the held-back notes
  shape: |
    def bigram_probs(X, y, size, smoothing=0.1):
        counts = np.zeros((size, size))
        for last, target in zip(X[:, ___], y):
            counts[last, target] += 1
        smoothed = counts + smoothing
        return smoothed / smoothed.sum(axis=___, keepdims=True)


    def bigram_chances(probs, X, y):
        return probs[___, y]
---
Before the network, two scores it has to beat. Guessing evenly among 65 characters has a perplexity of 65. The bigram from the forecasts, counted from the last character of each window, does a good deal better.

```
Guessing evenly: perplexity 65
Bigram on the held-back notes: perplexity 9.80
```

`perplexity` takes the chances a model gave to the characters that really came next, so the network can use it too.
