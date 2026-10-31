---
id: text-catch
type: make
title: Make it in text
files: [catch.py]
entry: catch.py
on_pass: { caitlin: "Fish in the bucket on the fourth turn, and boots cost a life. My rules. Now give it a window." }
hints:
  nudge: "Where is something on the turn it reaches the bottom row, and what decides whether it was caught?"
  plan:
    - Start with the bucket in the middle and nothing falling
    - Move one column, never off the ends
    - Drop into row 0
    - Everything falls one row
    - "Settle the bottom row: caught or missed"
    - Draw the rows, then the pier
  shape: |
    def update(self):
        if self.over:
            return
        still_falling = []
        for kind, column, row in self.falling:
            row += ___
            if row < self.rows - ___:
                still_falling.append([kind, column, row])
            elif column == ___:
                ...
        self.falling = still_falling


    def render(self):
        grid = [["."] * self.columns for _ in range(___)]
        for kind, column, row in self.falling:
            grid[row][column] = ___
        pier = ["_"] * self.columns
        pier[___] = "U"
        return ["".join(row) for row in grid] + ["".join(pier)]
---
Before there's a window, the rules in text. `catch.py` is Mackerel Night on a pier seven cells wide: write the `Catch` class from its docstring.

```text
...f...
.......
.......
.......
___U___
```

The loop at the bottom is written already: draw, read a key, update. It never changes the rules, and the rules never print anything. Press Run to play it, with `a`, `d` and Enter.

The checks drop fish and boots in columns they choose and count the turns, so nothing inside `Catch` is random: the randomness lives in the loop. That's the same line you'll keep at home.
