---
id: predict-chained
type: predict
title: Four hundred and twelve
concept: data-cleaning
dialogue:
  - yahya: "Find the impossible age, make it missing. One line. I've done harder."
code: |
  import numpy as np
  import pandas as pd

  crew = pd.DataFrame({
      "name": ["Samuel Vosper", "Walter Kerrow"],
      "age": [412.0, 19.0],
  })
  crew[crew["age"] > 100]["age"] = np.nan
  print(crew["age"].tolist())
question: What does this print?
options:
  - text: "[nan, 19.0]"
    misconception: chained-assignment-works
    feedback: "That's what Yahya meant. But `crew[crew[\"age\"] > 100]` is a filter, and a filter hands back a new table. `[\"age\"] = np.nan` changes that new table, which is thrown away at once. `crew` never hears about it."
  - text: "[412.0, 19.0]"
    correct: true
    feedback: "Right. Two sets of brackets, two steps: the first makes a new, filtered table, and the second changes a column of that. `crew` is untouched. One `.loc[rows, column]` does it in a single step, on `crew` itself."
after: |
  Run it, and read the warning pandas prints underneath. Then make the change the way that works: `crew.loc[crew["age"] > 100, "age"] = np.nan`.
---
Samuel Vosper did not join the crew at 412. Yahya wants his age marked missing, with `np.nan`.

Yahya's line has two sets of square brackets, one after the other.
