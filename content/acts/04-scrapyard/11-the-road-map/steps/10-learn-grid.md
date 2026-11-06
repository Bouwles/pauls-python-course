---
id: learn-grid
type: learn
title: Tiles as places
concept: graphs
code: |
  maze = ["S.#",
          "..#",
          "#.G"]

  row, col = (1, 1)
  for next_row, next_col in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:
      print((next_row, next_col), maze[next_row][next_col])
---
A maze drawn as text is a graph too. Each open tile is a place, and its neighbours are the open tiles up, down, left and right of it. Nobody writes the roads down: they're worked out from the drawing.

A tile is a `(row, col)` pair, and `maze[row][col]` is what's drawn there, `#` for a wall. The four tiles around a tile are one row up or down, or one column left or right.

The example looks round `(1, 1)` and prints each tile and what's on it: three open, and a wall on the right.

The usual slip is at the edges. Off the bottom or the right is an `IndexError`. Off the top or the left is worse: row `-1` is the last row, so Python says nothing.
