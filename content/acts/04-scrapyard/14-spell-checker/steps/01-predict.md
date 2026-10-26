---
id: predict
type: predict
title: Coins are not crates
concept: dynamic-programming
dialogue:
  - gwen: "Pay 4p with 1p and 2p coins. Three ways: four ones, two ones and a two, or two twos."
code: |
  def ways(amount):
      if amount == 0:
          return 1
      if amount < 0:
          return 0
      return ways(amount - 1) + ways(amount - 2)


  print(ways(4))
question: What does this print?
options:
  - text: "5"
    correct: true
    feedback: "Right. It tries a 1p or a 2p as the next coin every time, so it counts 1p, 1p, 2p and 2p, 1p, 1p as different ways. For crates in a row on a lorry, order would matter. In a hand of change, it doesn't."
  - text: "3"
    misconception: coin-orders-counted-once
    feedback: "That's Gwen's answer, not this code's. It tries a 1p or a 2p as the next coin every time, so 1p then 2p and 2p then 1p are two separate ways."
  - text: A RecursionError
    misconception: negative-amount-never-stops
    feedback: "`ways(1)` calls `ways(-1)`, but the second `if` stops that at once with 0. Every call gets smaller, and every path ends."
after: |
  Run it. Then think about how to count each handful only once. One way: decide how many 2p coins first, and never go back to them.
---
Gwen's question is about handfuls of change. This counts something close to it, by recursion.
