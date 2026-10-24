---
id: one-thing-more
type: milestone
title: "Milestone 3: one thing the paper didn't try"
evidence: link
dialogue:
  - wendt: "Now ask it something the authors didn't. That's where reproducing turns into finding out."
  - pip: "I'll change everything at once. Faster."
  - moss: "Then you'll know something changed, and nothing else."
checklist:
  - id: one-change
    text: "You've changed exactly one thing, and kept everything else as it was."
    why: "Change two things and you'll never know which one did it."
  - id: predicted
    text: "You wrote down what you expected to happen before you ran it."
    why: "A prediction written after the result is a description. Being wrong in writing is how you learn which part of your picture was off."
  - id: settings
    text: "You've tried at least three settings of the thing you changed, not just one."
    why: "One setting is a point. Three is the beginning of a shape."
  - id: same-axes
    text: "The new curves are drawn beside the original, on the same axes."
    why: "A difference you have to flick between two figures to see is a difference most people won't see."
  - id: in-numbers
    text: "You say, with numbers, whether the change moved the peak, flattened it, or did nothing."
    why: "'It changed a bit' isn't a finding. 'The peak fell from 46 to 1.3' is."
  - id: tested
    text: "Any new code has tests of its own in test_descent.py."
    why: "New code is where new bugs live, and a bug can look a lot like a discovery."
---
Choose one thing the paper didn't vary, or didn't vary this way, and change only that. Some ideas:

- the noise: 0, 0.1, 0.2 and 0.5
- the number of training examples: does the peak follow it?
- a small ridge penalty instead of the smallest-norm fit
- `tanh` features instead of ReLU
- a different true answer: a straight line, or something much wigglier

Write down what you expect before you run it, and why. Then run at least three settings, draw them beside the original curve on the same axes, and say in numbers what happened to the peak and to the far right of the curve.

Paste the link to the updated repository or gist.
