---
id: investigate-grid
type: investigate
title: A maze is a graph
concept: graphs
dialogue:
  - nell: "Since the pier lot went in, the yard's a maze. Lorries go in at the gate and come out at the chip shop."
  - moss: "Every open bit of ground is a place, and its roads are the four ways off it."
code: |
  maze = ["S.#",
          "..#",
          "#.G"]


  def neighbours(grid, tile):
      row, col = tile
      found = []
      for next_row, next_col in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:
          if grid[next_row][next_col] != "#":
              found.append((next_row, next_col))
      return found


  print(neighbours(maze, (1, 1)))
  print(neighbours(maze, (0, 0)))
tasks:
  - id: middle
    prompt: "Run it. What are the neighbours of `(1, 1)`?"
    kind: answer
    accept: ["[(0, 1), (2, 1), (1, 0)]", "(0, 1), (2, 1), (1, 0)", "[(0,1), (2,1), (1,0)]", "[(0,1),(2,1),(1,0)]"]
    feedback: "Up, down and left: the tile to the right is a wall. Nobody wrote these down as a dictionary of roads. They come from the drawing."
    wrong: "It's the first line printed."
  - id: corner
    prompt: "Add `print(neighbours(maze, (2, 2)))`, the G in the corner. What stops the program?"
    kind: answer
    accept: ["IndexError", "an IndexError", "index error", "IndexError: string index out of range", "string index out of range"]
    feedback: "An IndexError: row 3 isn't there. The tiles off the edge of the maze aren't neighbours, so they mustn't be looked at."
    wrong: "Read the last line of the traceback."
  - id: inside
    prompt: "Change `neighbours` so it only looks at a tile when its row and column are inside the maze."
    kind: run
    tests: |
      TESTS = [
          function("The corner G", call="neighbours", args=(["S.#", "..#", "#.G"], (2, 2)), expect=[(2, 1)],
                   hint="Check 0 <= next_row < len(grid) and 0 <= next_col < len(grid[next_row]) before you look at the tile."),
          function("An open bottom corner", call="neighbours", args=(["S.", ".."], (0, 0)), expect=[(1, 0), (0, 1)],
                   hint="Row -1 isn't off the top to Python. It's the last row. Check the row isn't below 0, too."),
      ]
    solution: |
      maze = ["S.#",
              "..#",
              "#.G"]


      def neighbours(grid, tile):
          row, col = tile
          found = []
          for next_row, next_col in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]:
              if 0 <= next_row < len(grid) and 0 <= next_col < len(grid[next_row]) and grid[next_row][next_col] != "#":
                  found.append((next_row, next_col))
          return found


      print(neighbours(maze, (1, 1)))
      print(neighbours(maze, (0, 0)))
      print(neighbours(maze, (2, 2)))
  - id: wrapped
    prompt: "Before your change, the neighbours of `(0, 0)` looked right, by luck. Which tile did `grid[-1][0]` look at?"
    kind: answer
    accept: ["(2, 0)", "2, 0", "(2,0)", "the bottom left", "bottom left", "the bottom-left tile", "the bottom row", "bottom row", "the last row", "last row", "#"]
    feedback: "`(2, 0)`, the bottom left: a negative index counts from the end. It happened to be a wall, so nobody noticed. In a maze with an open bottom corner, the gate would have had a neighbour off the top of the map."
    wrong: "A negative index counts from the end of the list."
---
A maze drawn as text is a graph too. Each open tile is a place, and its neighbours are the open tiles up, down, left and right of it. There's no dictionary of roads to keep: the neighbours can be worked out from the drawing whenever they're needed.

A tile is a `(row, col)` pair, and `grid[row][col]` is what's drawn there.
