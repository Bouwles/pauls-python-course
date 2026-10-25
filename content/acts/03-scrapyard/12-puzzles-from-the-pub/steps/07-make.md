---
id: make
type: make
title: Make Gwen's answer sheet
files: [answers.py]
entry: answers.py
on_pass: { gwen: "Four hundred and fifty, and Mr Ashby near enough. I'll read them out on Thursday." }
hints:
  nudge: "In the `edit_distance` table, what does the slot for the first `row` letters of one word and the first `col` letters of the other mean?"
  plan:
    - "ways_to_pay: a slot for every amount from 0 up, with one way to make 0p"
    - One kind of coin at a time, add the ways to make what's left after that coin
    - The answer is in the last slot
    - "edit_distance: the edges first, turning some letters into none, or none into some"
    - "Fill the rest row by row: matching letters copy up-left; otherwise 1 more than the smallest of up, left and up-left"
    - "mark: tidy both answers, then right, near enough, or wrong"
  shape: |
    def ways_to_pay(amount, coins):
        ways = [1] + [0] * amount
        for coin in coins:
            for pence in range(___, amount + 1):
                ways[pence] = ways[pence] + ways[___]
        return ways[amount]


    def edit_distance(given, correct):
        table = [[0] * (len(correct) + 1) for _ in range(len(given) + 1)]
        for row in range(len(given) + 1):
            table[row][0] = ___
        for col in range(len(correct) + 1):
            table[0][col] = ___
        for row in range(1, len(given) + 1):
            for col in range(1, len(correct) + 1):
                if given[row - 1] == correct[col - 1]:
                    table[row][col] = ___
                else:
                    table[row][col] = 1 + min(___, ___, ___)
        return table[len(given)][len(correct)]
---
Write the three functions in `answers.py`. For `ways_to_pay`, a cache on your own recursion works, or a table like Moss's, filled one kind of coin at a time.

`edit_distance` is a table with a row for each letter of `given` and a column for each letter of `correct`, plus a row and a column for no letters at all. `table[row][col]` is the fewest changes that turn the first `row` letters of one into the first `col` letters of the other. Turning letters into nothing takes one change per letter, so the edges fill themselves. For the rest: if the two letters match, copy the slot up and to the left. If not, it's 1 more than the smallest of up (take a letter out), left (put one in) and up-left (swap one).

The hidden checks count every call to your functions on £2 of change and two sixty-letter words.
