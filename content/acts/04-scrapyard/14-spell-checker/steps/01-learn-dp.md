---
id: learn-dp
type: learn
title: The same small questions
concept: dynamic-programming
code: |
  asked = []


  def ways(amount):
      asked.append(amount)
      if amount == 0:
          return 1
      if amount < 0:
          return 0
      return ways(amount - 1) + ways(amount - 2)


  print(ways(6), "ways")
  print(asked.count(2), "times asked about 2p")
---
Some questions come apart into smaller questions of the same kind. Count the ways to pay 6p, one coin at a time, with 1p and 2p coins: the last coin is a 1p or a 2p, so it's the ways to pay 5p plus the ways to pay 4p. And 5p needs 4p again, and 3p.

Asked like that, the same small questions turn up again and again. The example finds 13 ways, and asks about 2p five separate times.

**Dynamic programming** means answering each smaller question once and reusing the answer. Memoisation, from the file tree printer, is one way to do it. A table, later in this project, is another.

The usual slip is to work the same thing out many times without noticing.
