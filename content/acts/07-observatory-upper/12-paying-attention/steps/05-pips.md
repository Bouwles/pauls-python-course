---
id: pips
type: pips
title: Fix Aaesha's version
files: [peek.py]
entry: peek.py
dialogue:
  - aaesha: "Can you look at mine? I wrote the test before the attention. Every query's weights add up to 1."
  - aaesha: "The test fails, and I've checked the attention twice. Something's off."
dialogue_after:
  - aaesha: "Each query shares its attention out along its row. My test added up the columns."
  - aaesha: "The code was right. The test had the typo. That's the most annoying kind."
hints:
  nudge: "Which way does one query's attention run: along a row of `weights`, or down a column? Which way does the test add up?"
  plan:
    - Run it and read the row sums and the column sums
    - Find which assert fails
    - Point the sum along each row, one query at a time
    - Leave the attention, and the second assert, as they are
  shape: |
    def check_weights(weights):
        assert np.allclose(weights.sum(axis=___), 1), "every query's weights should add up to 1"
        assert np.all(weights[np.triu_indices(len(weights), k=1)] == 0), "nothing should look ahead"
---
Aaesha's `attention` runs every query at once, and `check_weights` is the test she wrote first. Run it and read the two lines of sums before the traceback.

Each row of `weights` is one query: how it shares its attention between the keys. Which should add up to 1, the rows or the columns?

Fix the test, not the attention. The checks make sure it still catches weights that are wrong.
