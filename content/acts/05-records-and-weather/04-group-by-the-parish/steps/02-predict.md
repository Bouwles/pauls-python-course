---
id: predict
type: predict
title: Five people, three parishes
concept: groupby
code: |
  import pandas as pd

  people = pd.DataFrame({
      "name": ["Walter Rook", "Edith Rowe", "Mary Rook", "Sam Rook", "Ann Jago"],
      "parish": ["Northgate", "Church Street", "Northgate", "Bankside", "Church Street"],
      "age": [88, 34, 52, 9, 40],
  })
  average_ages = people.groupby("parish")["age"].mean()
  for parish, age in average_ages.items():
      print(parish, age)
question: What does this print?
options:
  - text: |-
      Bankside 9.0
      Church Street 37.0
      Northgate 70.0
    correct: true
    feedback: "Right. One answer per parish, and the parishes come out sorted, whatever order the rows were in. The parish names become the labels of the result."
  - text: |-
      Northgate 70.0
      Church Street 37.0
      Bankside 9.0
    misconception: groupby-keeps-order
    feedback: "The averages are right, but `groupby` sorts the groups by their names. Northgate was met first and still comes last. Pass `sort=False` if you ever want the order of first appearance."
  - text: |-
      Northgate 70.0
      Church Street 37.0
      Northgate 70.0
      Bankside 9.0
      Church Street 37.0
    misconception: groupby-keeps-rows
    feedback: "`groupby` followed by `mean()` collapses each group to one row. Five people in three parishes gives three answers, not five."
after: |
  Run it. Then change `mean()` to `size()`, which counts the rows in each group, and run it again.
---
Five people, in the order they were typed up, grouped by parish.
