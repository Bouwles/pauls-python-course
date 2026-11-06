---
id: predict-csv
type: predict
title: A comma in the value
concept: csv-module
code: |
  import csv

  with open("repairs.csv", "w", newline="") as file:
      writer = csv.writer(file)
      writer.writerow(["repair", "times"])
      writer.writerow(["clock, tower", 1])

  with open("repairs.csv") as file:
      print(file.read())
question: What does this print?
options:
  - text: |-
      repair,times
      clock, tower,1
    misconception: csv-no-quotes
    feedback: "Written like that, a spreadsheet would read three columns: `clock`, ` tower` and `1`. `csv.writer` wraps a value with a comma inside in quotes, so it stays one value."
  - text: |-
      repair,times
      "clock, tower",1
    correct: true
    feedback: "The quotes keep `clock, tower` together as one value. A spreadsheet shows it without them, in one cell."
  - text: |-
      ['repair', 'times']
      ['clock, tower', 1]
    misconception: csv-writes-lists
    feedback: "That's how `print` shows a list. `writerow` writes the values themselves, with commas between them and no brackets."
---
One repair from Paul's book has a comma in its name.
