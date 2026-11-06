---
id: learn-csv
type: learn
title: A file a spreadsheet can open
concept: csv-module
code: |
  import csv

  with open("orders.csv", "w", newline="") as file:
      writer = csv.writer(file)
      writer.writerow(["drink", "times"])
      writer.writerow(["tea", 3])
      writer.writerow(["coffee", 2])

  with open("orders.csv") as file:
      print(file.read())
---
A **CSV** file is a table written as plain text: one row a line, with commas between the values. CSV stands for comma-separated values, and any spreadsheet can open one.

Aaesha wants her counts in one.

The `csv` module writes them properly. `csv.writer(file)` makes a writer for an open file, and `writer.writerow(["tea", 3])` writes one row from a list, commas and new line included. The first row is usually a **header**, the name of each column. Open the file with `newline=""`: the `csv` module asks for it.

The example writes three rows and prints `drink,times`, `tea,3`, `coffee,2`.

The usual slip is joining values with `", ".join()` yourself. A value with a comma inside then splits in two. `csv` puts quotes round it.
