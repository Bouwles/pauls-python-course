---
id: make
type: make
title: Make the sudoku solver
files: [sudoku.py]
entry: sudoku.py
on_pass: { gwen: "Two solved and one that can't be. Thirty years that third one's been on the wall." }
hints:
  nudge: "Moss's `seat` chose a team for the next table. What does `solve` choose each time, where does it put it, and what makes a choice no good?"
  plan:
    - "can_place: the digit isn't in the row, isn't in the column, and isn't in the 3 by 3 box"
    - "next_blank: the first 0, reading each row from the top"
    - "solve: no blank left: that's a solution"
    - Try each digit in turn in the next blank
    - "Already in its row, column or box: skip it"
    - Write it in, and carry on from the next blank
    - "It led to a solution: pass it back"
    - "It didn't: rub it out, and try the next"
    - "Nothing fits here: go back a square"
    - "show: each row as three groups of three, . for 0, and a line between the bands"
  shape: |
    def solve(grid):
        blank = next_blank(grid)
        if blank is None:
            return ___
        row, col = blank
        for digit in range(1, 10):
            if not can_place(grid, row, col, digit):
                continue
            grid[row][col] = ___
            if solve(grid):
                return True
            grid[row][col] = ___
        return ___
---
Write `can_place`, `next_blank`, `solve` and `show` in `sudoku.py`. Penhallow's three puzzles are in `puzzles.txt`, and `read_puzzles` turns each into nine rows of nine numbers, with 0 for a blank.

```
Puzzle 1
4 5 7 | 2 8 1 | 6 9 3
9 3 6 | 7 5 4 | 2 1 8
1 8 2 | 6 3 9 | 7 4 5
------+-------+------
```

`solve` is Moss's `seat`, with squares for tables and digits for teams: fill the next blank, check the choice at once, and when nothing fits, rub out the last digit and try the next one there. The comments are his subgoals, in sudoku.

The box a square is in starts at row `row // 3 * 3` and column `col // 3 * 3`.

The hidden checks solve a harder puzzle, give `solve` puzzles that fail at the first square and near the last, and check every digit is rubbed out again.
