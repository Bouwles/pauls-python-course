---
id: predict-move
type: predict
title: Into the rock
concept: mdps
code: |
  TRACK = ["...F",
           ".#.P",
           "S..."]
  STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}


  def move(tile, direction):
      row, col = tile
      d_row, d_col = STEPS[direction]
      new_row, new_col = row + d_row, col + d_col
      if 0 <= new_row < 3 and 0 <= new_col < 4 and TRACK[new_row][new_col] != "#":
          return (new_row, new_col)
      return tile


  # Told "up" on (2, 1): straight on, or a slip either way
  for direction in ["up", "left", "right"]:
      print(move((2, 1), direction))
question: What does this print?
options:
  - text: |-
      (2, 1)
      (2, 0)
      (2, 2)
    correct: true
    feedback: "Right. Up from (2, 1) is (1, 1), the rock, so the crab stays where it is. The two slips land on the tiles either side. A race can lose a step bumping into the rock, and still pay -1 for it."
  - text: |-
      (1, 1)
      (2, 0)
      (2, 2)
    misconception: bump-moves-anyway
    feedback: "(1, 1) is the rock, `#`. The `if` on line 11 turns the move down, and line 13 gives back the tile it started on."
---
`move` gives the tile one step leads to. The loop tries the three ways a crab told up can go.
