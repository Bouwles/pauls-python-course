---
id: learn-seed
type: learn
title: The same numbers every run
concept: random-module
code: |
  import random

  random.seed(314)
  print(random.randint(1, 100), random.randint(1, 100))

  random.seed(314)
  print(random.randint(1, 100), random.randint(1, 100))
---
`random` doesn't really pick by chance. It works its numbers out, one after another, from a starting point called a **seed**. `random.seed(314)` sets the seed.

That's useful when you want the same "random" numbers every run, to test a game or time something fairly. After the same seed, `random` gives the same numbers in the same order. Each call takes the next number along, so the two on a line differ. The example prints the same pair twice, run after run.

It's also why `random` is wrong for passwords. Anyone who knows the seed knows every number. `secrets` has no seed.

The usual slip is to think a seed makes every number the same. It makes every run the same.
