---
id: sandbanks
type: make
title: "Question 5: Sandbanks at low water"
files: [sandbanks.py]
entry: sandbanks.py
on_pass: { yahya.proud: "Every bank on the chart, biggest first. Flood fill in a dozen lines. Elegant." }
hints:
  nudge: "Standing on one square of sand, which squares belong to the same bank? And what stops you counting the square you came from all over again?"
  plan:
    - A set of the squares already counted
    - "A recursive helper: the size of the bank from this square"
    - "Off the chart, water, or already counted: 0"
    - Otherwise mark it counted, then 1 plus the helper on all four neighbours
    - Go through every square; each sand square not yet counted starts a new bank
    - Biggest first
  shape: |
    def bank_size(chart, row, column, counted):
        if row < 0 or row >= len(chart) or column < 0 or column >= len(chart[row]):
            return 0
        if chart[row][column] != "#" or ___ in counted:
            return 0
        counted.add(___)
        return (1
                + bank_size(chart, row - 1, column, counted)
                + ___
                + ___
                + ___)


    def bank_sizes(chart):
        counted = set()
        sizes = []
        for row in range(len(chart)):
            for column in range(len(chart[row])):
                if chart[row][column] == "#" and (row, column) not in counted:
                    sizes.append(___)
        return sorted(sizes, ___)
---
At low water, a chart of the estuary shows sand as `#` and water as `.`. Sand squares that touch up, down, left or right are one sandbank. Touching at a corner doesn't join them.

Write `bank_sizes(chart)`: how many squares are in each sandbank, biggest first. `chart` is a list of strings, all the same length. Leave it as it was.

A recursive flood fill is the natural tool. The size of the bank from one square is 1, plus the size from each of its four neighbours, as long as each square is only counted once.

**Limits:** at most 20 rows and 20 columns.

```
bank_sizes(["##..#",
            "#...#",          gives [3, 2, 1]
            "..#..",
            "....."])

bank_sizes(["#.",
            ".#"])            gives [1, 1]     corners don't join
```
