---
id: pips
type: pips
title: Pip's Version
files: [tide_check.py]
entry: tide_check.py
dialogue:
  - pip: "I ran her network over the whole roll. Out by 8.8 centimetres. Her note says under six."
  - pip: "Close enough. Notes are optimistic. Mine certainly are."
dialogue_after:
  - pip: "It forgot every hour, and I marked it against the hour it had just read."
  - pip: "Two wrongs made nearly a right. That's worse than one wrong, somehow."
hints:
  nudge: "How much does the network remember from one hour to the next in Pip's `run`? And which hour is each guess a guess about?"
  plan:
    - Find where the memory is emptied
    - Empty it once, before the first hour
    - Mark each guess against the reading an hour later
    - Leave out the last guess, which has nothing to be marked against
  shape: |
    def run(xs, params):
        h = ___
        hiddens, guesses = [], []
        for x in xs:
            h, guess = step(x, h, params)
            ...


    def one_hour_error(heights, params):
        ...
        return np.mean(np.abs(guesses[___] * SCALE + MEAN - heights[___]))
---
`tides.csv` is Penhallow's roll: the harbour gauge, one height an hour for twelve days. `rnn_weights.json` is her network: eight hidden neurons. Readings go in scaled, as `(height - 2.5) / 2.0`, and each guess comes out the same way.

Pip's `step` is Wendt's, and it works. There are two bugs elsewhere, and they flatter each other: fix either one alone and the number gets worse. Fix both and it should match her note.
