---
id: predict-crowd
type: predict
title: Fifty guessers
concept: ensembles
code: |
  import numpy as np

  rng = np.random.default_rng(1)
  truth = rng.uniform(0.3, 0.95, 1000)                 # a thousand applicants' real chance of repaying
  guessers = truth + rng.normal(0, 0.2, (50, 1000))    # fifty officers, each wrong in their own way
  copies = np.tile(guessers[0], (50, 1))               # one officer, copied fifty times

  one = np.mean((guessers[0] - truth) ** 2)
  fifty = np.mean((guessers.mean(axis=0) - truth) ** 2)
  fifty_copies = np.mean((copies.mean(axis=0) - truth) ** 2)
  print(fifty < one / 10, np.isclose(fifty_copies, one))
question: "Is the average of fifty different guessers more than ten times better than one? And is the average of fifty copies exactly as good as one?"
options:
  - text: "False True"
    misconception: averaging-cannot-help
    feedback: "Each guesser is wrong in their own way, some high, some low. Averaged, the misses mostly cancel: fifty independent guesses cut the squared error about fifty times."
  - text: "True True"
    correct: true
    feedback: "Right. Fifty independent errors largely cancel, so the average is about fifty times better. Fifty copies make the same miss fifty times, and the average of fifty identical misses is that miss."
  - text: "True False"
    misconception: copies-add-evidence
    feedback: "A copy adds no new information. The average of fifty identical guesses is the guess itself, so it's exactly as wrong as one guesser."
after: |
  Run it, then print `one` and `fifty`.
---
Fifty loan officers each guess the chance that a thousand applicants repay. Each is out by about 0.2, at random. `np.tile` makes fifty copies of the first officer, and `.mean(axis=0)` averages the fifty guesses for each applicant.
