---
id: learn-edit
type: learn
title: A table for two words
concept: dynamic-programming
code: |
  def edit_table(given, correct):
      table = [[0] * (len(correct) + 1) for _ in range(len(given) + 1)]
      for row in range(len(given) + 1):
          table[row][0] = row
      for col in range(len(correct) + 1):
          table[0][col] = col
      for row in range(1, len(given) + 1):
          for col in range(1, len(correct) + 1):
              if given[row - 1] == correct[col - 1]:
                  table[row][col] = table[row - 1][col - 1]
              else:
                  table[row][col] = 1 + min(table[row - 1][col], table[row][col - 1], table[row - 1][col - 1])
      return table


  for line in edit_table("cat", "cart"):
      print(line)
---
The **edit distance** between two words is the fewest changes from one to the other: put a letter in, take one out, or swap one. `cat` to `cart` is 1.

Picture `cart` along the top of a grid and `cat` down the side, each with an empty start. `table[row][col]` is the fewest changes between the first `row` letters of one and the first `col` of the other. The first row and column are one change per letter.

Every other slot comes from three filled already. Letters match: copy the slot up and to the left. Otherwise: 1 more than the smallest of up (take a letter out), left (put one in) and up-left (swap one).

The answer, `1`, is bottom right. The usual slip is the letters: slot 1 is the first letter, at position 0.
