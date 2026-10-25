---
id: make-search
type: make
title: Make the picture-round checker
files: [grid.py]
entry: grid.py
on_pass: { gwen: "Seven in, three out. I've been looking for that whelk since 1994." }
hints:
  nudge: "Moss's `seat` chose a team for the next table. What does your search choose each time, and what makes a choice no good?"
  plan:
    - Try every square as the first letter
    - "Every letter found: that's the word"
    - Try each square up, down, left and right of the last one
    - "Off the grid, on the path already, or the wrong letter: skip it"
    - Put it on the path, and carry on with the next letter
    - "It led to the word: pass it back"
    - "It didn't: take it off the path, and try the next"
    - "missing: every word find_word gives None for"
  shape: |
    def find_word(grid, word):
        path = []

        def follow(row, col):
            if not (0 <= row < len(grid) and 0 <= col < len(grid[row])):
                return False
            if (row, col) in path or grid[row][col] != word[___]:
                return False
            path.append((row, col))
            if len(path) == ___:
                return True
            for next_row, next_col in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
                if follow(next_row, next_col):
                    return True
            path.___()
            return False

        for row in range(len(grid)):
            for col in range(len(grid[row])):
                if ___:
                    return path
        return None
---
Write `find_word` and `missing` in `grid.py`. Penhallow's grid and Gwen's ten words are there, with a note.

It's Moss's seating in a new shape. Instead of a team for the next table, choose a square for the next letter: one of the four next to the last. A square that's off the grid, already on the path, or the wrong letter is a feud: skip it. When a square leads nowhere, take it off the path, as Moss stood the last team up.

`len(path)` tells you which letter of the word you're looking for next.

The hidden checks look for words that turn corners, words that are nearly there, and one that's only found if your search gives back the squares a dead end used.
