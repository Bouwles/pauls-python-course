---
id: pips
type: pips
title: Fix Caitlin's version
files: [babble.py]
entry: babble.py
dialogue:
  - caitlin.pleased: "Can you look at mine? I just counted the pairs and divided, and the game's radio could be reading it by teatime."
  - caitlin.confused: "NumPy says my probabilities don't add up to 1, but they're probabilities, adding up to 1 is literally what they do."
dialogue_after:
  - caitlin.laughing: "I divided by the columns, and 'iv' never came up in thirty forecasts so it was impossible, until 'river' turned up."
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
`forecasts.txt` holds thirty of Caitlin's shipping forecasts, one a line. `held_back.txt` holds five more that the model never learns from, to work out its perplexity.

Run Caitlin's version. There are two bugs.
