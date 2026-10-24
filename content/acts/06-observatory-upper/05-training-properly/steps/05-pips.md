---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Mini-batches. Shuffle the evenings, hand them over a few at a time. I shuffle both arrays. Thoroughly."
  - pip: "The loss won't go below a quarter, though. I think eight hundred evenings is too many for it."
dialogue_after:
  - pip: "So I shuffled the evenings one way and the answers another. It was learning to guess."
  - pip: "And the last two evenings never came round at all. Poor evenings."
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
Training on all eight hundred evenings at once means one step per pass through the log. A **mini-batch** is a handful of evenings, a few dozen, and each handful gets its own step: twenty-five steps a pass instead of one. Each step's gradient is only an estimate, a bit noisy, but there are far more of them. Shuffle the evenings every epoch, so the handfuls are different each time.

Pip's `batches` should give every evening once an epoch, each with its own answers. His demonstration numbers eight evenings so you can see which is which: each answer is its evening times ten. Run it.
