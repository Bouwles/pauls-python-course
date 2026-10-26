---
id: predict-and
type: predict
title: Two conditions
concept: selecting-filtering
dialogue:
  - pip: "Over fifty and at the harbour. Two conditions, one and. Done."
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Edith Hollis", "Walter Rook", "Mary Rook", "Sam Rook"],
      "parish": ["High Street", "Harbour", "Harbour", "Harbour"],
      "age": [34, 88, 52, 9],
  })
  older = people[people["age"] > 50 and people["parish"] == "Harbour"]
  print(len(older))
question: What happens?
verify: error
options:
  - text: "It prints 2"
    misconception: and-combines-series
    feedback: "That's what Pip meant, but `and` can't do it. `and` asks whether a whole Series is true, and four answers have no single answer. Row by row, it's `&`."
  - text: "It prints 3"
    misconception: and-returns-last-condition
    feedback: "A reasonable guess, since `and` on ordinary values hands back one side. But pandas won't let a Series be judged true or false at all, so it stops before it gets that far."
  - text: A ValueError
    correct: true
    error: ValueError
    feedback: "Right. `and` asks whether the whole Series is true, and pandas refuses to guess. Row by row it's `&`, with brackets round each condition: `(people[\"age\"] > 50) & (people[\"parish\"] == \"Harbour\")`. Row-by-row \"or\" is `|`."
after: |
  Run it and read the last line of the traceback. Then change `and` to `&`, put brackets round each condition, and run it again.
---
`people["age"] > 50` gives a Series of `True` and `False`, one for each row. So does `people["parish"] == "Harbour"`.

Pip wants the rows where both are `True`.
