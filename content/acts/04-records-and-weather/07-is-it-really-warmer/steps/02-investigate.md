---
id: investigate
type: investigate
title: If nothing were changing
concept: probability
dialogue:
  - priya: "Nine of the ten warmest years are recent. Could that happen by chance? Let's count."
code: |
  import numpy as np
  import pandas as pd

  station = pd.read_csv("station.csv")
  yearly = station.groupby("year")["temp"].mean()

  warmest = yearly.sort_values(ascending=False).index[:10]
  print(sorted(warmest))
  in_last_thirty = (warmest >= 1995).sum()
  print(in_last_thirty, "of the ten warmest years are since 1995")

  # If nothing were changing, the warmest years could be any years at all.
  rng = np.random.default_rng(1)
  years = np.arange(1925, 2025)
  trials = 10_000
  as_many = 0
  for trial in range(trials):
      pretend_warmest = rng.permutation(years)[:10]
      if (pretend_warmest >= 1995).sum() >= in_last_thirty:
          as_many += 1
  print(as_many / trials)
tasks:
  - id: odd-one
    prompt: "Run it. Which of the ten warmest years is not since 1995?"
    kind: answer
    accept: ["1989"]
    feedback: "1989. The other nine are all from the last thirty years."
    wrong: "Look at the sorted list on the first line."
  - id: simulated
    prompt: "The loop deals the hundred years out in a random order, ten thousand times, and pretends the first ten are the warmest. In what share of the trials were nine or more of them since 1995?"
    kind: answer
    accept: ["0.0002", "2 in 10,000", "2 in 10000", "0.02%", "two in ten thousand"]
    feedback: "0.0002: two trials in ten thousand. If the years were in no particular order, nine of the warmest ten landing in the last thirty would almost never happen."
    wrong: "It's the last line printed."
  - id: by-thinking
    prompt: "Without running anything: if the years were in a random order, what is the chance that the single warmest year is one of the thirty since 1995?"
    kind: answer
    accept: ["0.3", "30%", "3/10", "30/100", "0.30", "30 in 100", "3 in 10"]
    feedback: "0.3: thirty of the hundred years are since 1995, and each is equally likely to be the warmest."
    wrong: "How many of the hundred years are since 1995, and are they all equally likely to be first?"
  - id: check-it
    prompt: "Check that by simulation. Add a second count inside the loop, and make `chance_warmest` the share of trials in which the first of the shuffled years is 1995 or later."
    kind: run
    tests: |
      def chance(ctx):
          value = getattr(ctx.module(), "chance_warmest", None)
          if value is None:
              raise CheckFailed("Make a variable called chance_warmest.")
          if not 0.27 < float(value) < 0.33:
              raise CheckFailed("The share of trials whose first shuffled year is 1995 or later should be close to 0.3.", actual=value)


      TESTS = [custom("About three trials in ten", chance)]
    solution: |
      import numpy as np
      import pandas as pd

      station = pd.read_csv("station.csv")
      yearly = station.groupby("year")["temp"].mean()

      warmest = yearly.sort_values(ascending=False).index[:10]
      print(sorted(warmest))
      in_last_thirty = (warmest >= 1995).sum()
      print(in_last_thirty, "of the ten warmest years are since 1995")

      # If nothing were changing, the warmest years could be any years at all.
      rng = np.random.default_rng(1)
      years = np.arange(1925, 2025)
      trials = 10_000
      as_many = 0
      first_is_recent = 0
      for trial in range(trials):
          shuffled = rng.permutation(years)
          pretend_warmest = shuffled[:10]
          if (pretend_warmest >= 1995).sum() >= in_last_thirty:
              as_many += 1
          if shuffled[0] >= 1995:
              first_is_recent += 1
      print(as_many / trials)
      chance_warmest = first_is_recent / trials
      print(chance_warmest)
  - id: short-run
    prompt: "Now set `trials` to 20 and run it with seeds 2, 3 and 4. Does `chance_warmest` come out at exactly 0.3 each time?"
    kind: answer
    accept: ["no", "nope", "no, it wobbles", "not always", "no, it changes", "no it changes", "no, it varies"]
    feedback: "No. Twenty trials give a rough estimate that wobbles from seed to seed; ten thousand settle close to the true chance. Set `trials` back when you're done."
    wrong: "Run it three times, changing the seed, and compare the last line."
---
A **probability** is a number from 0 to 1: how often something happens over many tries. When it's hard to work out, **simulate**: make the tries happen, many times, and count.

`rng.permutation(years)` gives the years in a random order, a different order each time round the loop.
