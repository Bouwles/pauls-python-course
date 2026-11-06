---
id: learn-choice
type: learn
title: Pick one of these
concept: random-module
code: |
  import random

  DRINKS = ["tea", "coffee", "hot chocolate"]
  drink = random.choice(DRINKS)
  print("Today's round:", drink)
---
`random.choice(a_list)` picks one item from a list, each one as likely as the others. It's in the same `random` module as `randint`, from Caitlin's guessing game.

The machine needs a hand nobody chose: rock, paper or scissors, at random.

The example picks a drink for the Studio's tea round. Run it a few times and it changes. `DRINKS` is written in capitals because the list never changes while the program runs. That's a habit programmers keep, so a reader knows not to look for it changing.

The usual slip is the same as with `randint`. `choice` picks once each time it's called. A variable that holds the result keeps that one, however often you read it.
