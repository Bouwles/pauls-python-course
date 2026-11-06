---
id: learn-growth
type: learn
title: What doubling does
concept: big-o
code: |
  for n in [100, 200, 400]:
      halvings = 0
      pile = n
      while pile > 1:
          pile = pile // 2
          halvings = halvings + 1
      print(n, n * n, halvings)
---
**Big-O** is a short way to say how the steps grow as the pile grows. Picture the pile doubling, and ask what the steps do:

- **O(1)**: nothing. Taking the top part off a pile.
- **O(n)**: they double. Looking at each part once.
- **O(n²)**: four times as many. Every part against every part.
- **O(log n)**: one more. Each step halves what's left, like Yahya finding a number from 1 to 100 in seven guesses.
- **O(n log n)**: a little over double. Good sorting goes like this.

The example doubles n twice. `n * n` goes up four times each time; the halvings go `6`, `7`, `8`.

The usual slip is to judge from one count. Ten thousand steps could be any growth. You need two sizes.
