---
id: learn-shuffle
type: learn
title: A different order every week
concept: random-module
code: |
  import random

  rounds = ["Music", "Food", "Games", "Local"]
  random.shuffle(rounds)
  print(rounds)
---
`random.shuffle(a_list)` puts a list into a random order. It's in the same `random` module as `randint` and `choice`.

Caitlin wants her questions in a new order every Thursday, so nobody can learn them by heart.

It changes the list it's given, where it stands, and hands back `None`. There's no new list to keep: after the line runs, `rounds` itself is shuffled. Run the example a few times and the order changes.

The usual slip is `rounds = random.shuffle(rounds)`. That shuffles the list, then puts `None`, what `shuffle` handed back, in `rounds`. The shuffled list is lost.
