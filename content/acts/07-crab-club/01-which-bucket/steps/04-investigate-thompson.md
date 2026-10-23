---
id: investigate-thompson
type: investigate
title: What might be true
concept: exploration-exploitation
code: |
  import numpy as np

  rng = np.random.default_rng(4)
  # Whelks: 60 good runs, 30 bad. Cheese: 2 good runs, 1 bad.
  whelks = rng.beta(60 + 1, 30 + 1, size=8)
  cheese = rng.beta(2 + 1, 1 + 1, size=8)
  print("whelks:", whelks.round(2))
  print("cheese:", cheese.round(2))
  print("cheese beats whelks in", (cheese > whelks).sum(), "of 8")
tasks:
  - id: wider
    prompt: "Both buckets have given a good run two times in three. Run it. Whose eight samples are more spread out?"
    kind: answer
    accept: ["cheese", "the cheese", "cheese's", "cheese is"]
    feedback: "Cheese. Three runs is hardly any evidence, so almost any rate is plausible. Ninety runs pin the whelks near two thirds. Thompson sampling will still try cheese now and then, exactly as often as cheese might really be better."
    wrong: "Look at how far apart the smallest and biggest numbers are on each line."
  - id: narrower
    prompt: "Change cheese to 20 good runs and 10 bad. Are its samples now more spread out than before, or less?"
    kind: answer
    accept: ["less", "less spread out", "less spread", "less than before", "less spread out than before", "not as spread out", "narrower", "tighter", "closer together", "less spread out now"]
    feedback: "Less. More evidence, less doubt. As a bucket is tried, its samples close in on its true rate, and Thompson sampling explores it less."
    wrong: "Compare the gap between cheese's smallest and biggest sample before and after."
---
**Thompson sampling** keeps a belief about each bucket's rate, not just one number. With `wins` good runs and `losses` bad ones, the belief is a **Beta distribution**, `Beta(wins + 1, losses + 1)`. The `+ 1`s mean a bucket nobody has tried could have any rate from 0 to 1, all equally likely.

Each run, it draws one plausible rate for every bucket from its belief, and feeds Sir Reginald from whichever bucket drew the biggest. Uncertain buckets draw wild numbers and win sometimes; well-known ones draw close to what they are.
