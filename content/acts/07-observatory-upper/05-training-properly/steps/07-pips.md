---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.proud: "Can you look at mine? Mini-batches: shuffle the evenings, hand them over a few at a time. I shuffle both arrays. Thoroughly."
  - caitlin.confused: "The loss won't go below a quarter, though. Something's off."
dialogue_after:
  - caitlin.surprised: "So I shuffled the evenings one way and the answers another. It was learning to guess."
  - caitlin.laughing: "And the last two evenings never came round at all. I never checked where the range stops."
hints:
  nudge: "After `rng.shuffle(X)` and `rng.shuffle(T)`, is the first row of `X` still the evening whose answer is the first row of `T`?"
  plan:
    - Read the printed batches and check each answer against its evening
    - Shuffle one list of row numbers, and use it for both arrays
    - Leave the arrays you were given as they were
    - Start a batch at every multiple of size, right up to the end
  shape: |
    def batches(X, T, size, rng):
        order = rng.___(len(X))
        for start in range(0, ___, size):
            rows = order[start:start + size]
            yield X[___], T[___]
---
Caitlin's `batches` should give every evening once an epoch, each with its own answers. Her demonstration numbers eight evenings so you can see which is which: each answer is its evening times ten. Run it, and check each answer against its evening.

There are two bugs. Fix both, and leave the arrays you were given as they were.
