---
id: learn-loc-set
type: learn
title: Changing some of the rows
concept: data-cleaning
code: |
  import numpy as np
  import pandas as pd

  crew = pd.DataFrame({
      "name": ["Samuel Vosper", "Walter Kerrow"],
      "age": [412.0, 19.0],
  })
  crew.loc[crew["age"] > 100, "age"] = np.nan
  print(crew["age"].tolist())
---
`table.loc[condition, column] = value` changes one column, in the rows where the condition is `True`, in the table itself. It's `.loc` with a condition where the row label would go: it picks rows and a column in one go, and the `=` writes into those places.

So `crew.loc[crew["age"] > 100, "age"] = np.nan` marks every impossible age missing. Nobody joined a river rescue crew at 412. The example prints `[nan, 19.0]`.

The usual slip is two sets of brackets: `crew[crew["age"] > 100]["age"] = np.nan`. The first makes a new, filtered table, the second changes that, and it's thrown away at once. `crew` is untouched.
