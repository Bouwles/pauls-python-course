---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Moss says only the move he made gets blamed. Seemed stingy. I blamed all four."
  - pip: "One memory: up from the start was worth 5. Now every move from the start is worth 5."
dialogue_after:
  - pip: "The other three moves never happened. No target, no blame. I was teaching it rumours."
hints:
  nudge: "The loss looks at one Q-value per memory. Which entries of `dQ` can change the loss at all?"
  plan:
    - Run it and read the four Q-values for the start
    - "Work out which Q-values the loss uses: one per memory, at its own action"
    - "Make dQ zero everywhere else"
  shape: |
    dQ = np.zeros_like(Q)
    dQ[np.arange(n), ___] = 2 * (___ - y) / n
---
Pip's `gradients` is the backward pass from Neural Network from Scratch, with a change at the loss end. His program trains on a single memory, then prints the four Q-values for the start.

Run it, then fix `gradients`. The checks compare it with gradients measured by nudging each weight, as in Neural Network from Scratch.
