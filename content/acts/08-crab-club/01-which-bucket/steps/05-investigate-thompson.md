---
id: investigate-thompson
type: investigate
title: What might be true
concept: exploration-exploitation
code: |
  import numpy as np

  rng = np.random.default_rng(4)
  # Beat the crab: 60 came in, 300 walked on. Free go after six: 2 came in, 10 walked on.
  crab = rng.beta(60 + 1, 300 + 1, size=8)
  free_go = rng.beta(2 + 1, 10 + 1, size=8)
  print("beat the crab:", crab.round(2))
  print("free go after six:", free_go.round(2))
  print("free go beats the crab flyer in", (free_go > crab).sum(), "of 8")
tasks:
  - id: wider
    prompt: "Both flyers have brought in one visitor in six. Run it. Whose eight samples are more spread out?"
    kind: answer
    accept: ["free go after six", "free go", "the free go", "the free go after six", "free_go", "free go's", "free go after six's"]
    feedback: "The free go. Twelve visitors is hardly any evidence, so almost any rate is plausible. Three hundred and sixty pin Beat the crab near one in six. Thompson sampling will still hand out the free go now and then, about as often as it might really be the better one."
    wrong: "Look at how far apart the smallest and biggest numbers are on each line."
  - id: narrower
    prompt: "Change the free go to 20 who came in and 100 who walked on. Are its samples now more spread out than before, or less?"
    kind: answer
    accept: ["less", "less spread out", "less spread", "less than before", "less spread out than before", "not as spread out", "narrower", "tighter", "closer together", "less spread out now"]
    feedback: "Less. More evidence, less doubt. As a version is handed out, its samples close in on its true rate, and Thompson sampling explores it less."
    wrong: "Compare the gap between the free go's smallest and biggest sample before and after."
---
**Thompson sampling** keeps a belief about each flyer's rate, not just one number. With `wins` visitors who came in and `losses` who walked on, the belief is a **Beta distribution**, `Beta(wins + 1, losses + 1)`. The `+ 1`s mean a flyer nobody has been handed could have any rate from 0 to 1, all equally likely.

For each visitor, it draws one plausible rate for every flyer from its belief, and hands out whichever drew the biggest. Uncertain flyers draw wild numbers and win sometimes; well-known ones draw close to what they are.
