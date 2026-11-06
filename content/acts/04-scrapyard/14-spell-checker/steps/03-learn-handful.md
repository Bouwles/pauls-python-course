---
id: learn-handful
type: learn
title: Each handful once
concept: dynamic-programming
code: |
  def ways(amount, coins):
      """Ways to make amount from coins: use the first coin again, or never use it."""
      if amount == 0:
          return 1
      if amount < 0 or not coins:
          return 0
      return ways(amount - coins[0], coins) + ways(amount, coins[1:])


  print(ways(4, (1, 2)))
  print(ways(6, (1, 2)))
---
Counting one coin at a time counts 1p then 2p and 2p then 1p as two ways. In a hand of change they're the same handful.

To count each handful once, decide one kind of coin at a time. At every step there are two smaller questions: use the first kind of coin again, or leave it behind for good with `coins[1:]`, the coins after the first. Every handful is then built in one order: all its 1p coins, then all its 2p coins.

`not coins` is `True` when no kinds of coin are left. The example prints `3`, Yahya's three ways to pay 4p, then `4` for 6p.

The usual slip is to let a coin come back after it's been left behind. Then the same handful is counted twice.
