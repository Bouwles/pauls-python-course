---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Tom's lamp log. Three nights and a fog. Count what follows what."
code: |
  import numpy as np

  log = "lamp lit\nlamp out\nlamp lit\nfog\n"

  vocab = sorted(set(log))
  index = {char: i for i, char in enumerate(vocab)}
  ids = [index[char] for char in log]

  size = len(vocab)
  counts = np.zeros((size, size))
  for a, b in zip(ids, ids[1:]):
      counts[a, b] += 1

  smoothed = counts + 1
  probs = smoothed / smoothed.sum(axis=1, keepdims=True)

  for char, chance in zip(vocab, probs[index["l"]]):
      if chance > 0.1:
          print(repr(char), round(float(chance), 2))
subgoals:
  - label: "Make the vocabulary: every character once, in order"
    lines: [5, 6]
  - label: Turn the text into ids
    lines: [7, 7]
  - label: "Count each pair: this character, then the next"
    lines: [9, 12]
  - label: Add to every count, then make each row add up to 1
    lines: [14, 15]
  - label: Read off the chances
    lines: [17, 19]
explain:
  prompt: "Why add 1 to every count before dividing?"
  answer: "Some pairs never happened in Tom's log, like 'z' after 'l'. Without the 1 their chance would be exactly 0, and if one ever turned up in new text, minus the log of 0 is infinite: one surprise would make the whole score infinite. Adding a little to every count says unlikely, not impossible."
  concept: language-models
---
Each row of `probs` is a little forecast: given this character, the chances of each character coming next. A model that guesses the next token is a **language model**, and this one, looking back one character, is a **bigram** model.

The newline counts as a character too. It marks where one entry ends and the next begins, so the model learns how entries start and finish.
