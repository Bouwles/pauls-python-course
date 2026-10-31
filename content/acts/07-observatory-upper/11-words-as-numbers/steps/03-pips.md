---
id: pips
type: pips
title: Fix Caitlin's version
files: [babble.py]
entry: babble.py
dialogue:
  - caitlin: "Can you look at mine? Count the pairs, divide, done. The game's radio could be reading it by teatime."
  - caitlin: "NumPy says my probabilities don't add up to 1. They're probabilities. That's their whole job."
dialogue_after:
  - caitlin: "I divided by the columns. Every row was somebody else's total."
  - caitlin: "And 'iv' never comes up in thirty forecasts, so its chance was nothing at all. Then 'river' turned up."
hints:
  nudge: "Which way does each row of `probs` need to add up to 1? And what chance does a pair get if it never happened in the thirty forecasts?"
  plan:
    - Read the traceback and find the chances that don't add up
    - Divide each row by its own total
    - Run it again and read the perplexity
    - Add the smoothing to every count first
  shape: |
    def probabilities(counts, smoothing=0.1):
        smoothed = counts + ___
        return smoothed / smoothed.sum(axis=___, keepdims=True)
---
`forecasts.txt` holds thirty of Caitlin's shipping forecasts, one a line. `held_back.txt` holds five more that the model never learns from.

**Perplexity** scores a language model on text it hasn't seen. Take the average of minus the log of the chance it gave each real next character, then raise e to that. Guessing evenly among 39 characters scores 39. Lower is better: a perplexity of 7 is as unsure as choosing between seven characters.

Run Caitlin's version. There are two bugs.
