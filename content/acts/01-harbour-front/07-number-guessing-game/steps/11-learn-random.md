---
id: learn-random
type: learn
title: Picking at random
concept: random-module
code: |
  import random

  seat = random.randint(1, 5)
  print("Tea round: seat", seat)
  print("Seat", seat, "puts the kettle on.")
---
`random.randint(low, high)` picks a whole number from `low` to `high`, and either end can come up.

It's how a program gets a number nobody chose: a dice roll, a raffle ticket, a secret for a guessing game.

The example picks a seat from 1 to 5 for the tea round and prints it twice. Run it a few times. The seat changes from run to run, but within one run both lines show the same seat.

That's the thing people get wrong. `randint` picks once, each time it's called, on line 3. The variable `seat` keeps that number. Reading `seat` again doesn't pick again.

Unlike `range(1, 5)`, which stops before 5, `randint(1, 5)` can give 5.
