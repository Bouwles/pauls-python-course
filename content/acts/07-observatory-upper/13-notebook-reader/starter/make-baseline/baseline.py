"""The scores to beat: guessing evenly, and the bigram from the forecasts.

perplexity(chances)                       e to the average of minus the log of each chance
bigram_probs(X, y, size, smoothing=0.1)   counts of each window's last character followed by
                                          its target, plus smoothing, rows divided by their totals
bigram_chances(probs, X, y)               the chance the bigram gives each real next character

Run as a program: the perplexity of guessing evenly, and of the bigram on the held-back notes.
"""

import numpy as np

from notes import build_vocab, load_notes, split_notes, windows
