---
id: investigate-thompson
type: investigate
title: What might be true
concept: exploration-exploitation
dialogue:
  - aaesha.pleased: "This one keeps a belief about each screen, not just a number. Much more like a person."
code: |
  import numpy as np

  rng = np.random.default_rng(4)
  # Waving crab: 60 played, 300 walked on. Flashing coin: 2 played, 10 walked on.
  crab = rng.beta(60 + 1, 300 + 1, size=8)
  coin = rng.beta(2 + 1, 10 + 1, size=8)
  print("waving crab:", crab.round(2))
  print("flashing coin:", coin.round(2))
  print("flashing coin beats the waving crab in", (coin > crab).sum(), "of 8")
tasks:
  - id: wider
    prompt: "Both screens have brought in one visitor in six. Run it. Whose eight samples are more spread out?"
    kind: answer
    accept: ["flashing coin", "the flashing coin", "coin", "the coin", "flashing coin's", "the flashing coin's", "coin's"]
    feedback: "The flashing coin. Twelve visitors is hardly any evidence, so almost any rate is plausible. Three hundred and sixty pin the waving crab near one in six. Thompson sampling will still show the flashing coin now and then, about as often as it might really be the better one."
    wrong: "Look at how far apart the smallest and biggest numbers are on each line."
  - id: narrower
    prompt: "Change the flashing coin to 20 who played and 100 who walked on. Are its samples now more spread out than before, or less?"
    kind: answer
    accept: ["less", "less spread out", "less spread", "less than before", "less spread out than before", "not as spread out", "narrower", "tighter", "closer together", "less spread out now"]
    feedback: "Less. More evidence, less doubt. As a version is shown, its samples close in on its true rate, and Thompson sampling explores it less."
    wrong: "Compare the gap between the flashing coin's smallest and biggest sample before and after."
---
**Thompson sampling** keeps a belief about each screen's rate, not just one number. With `wins` visitors who played and `losses` who walked on, the belief is a **Beta distribution**, `Beta(wins + 1, losses + 1)`. The `+ 1`s mean a screen nobody has been shown could have any rate from 0 to 1, all equally likely.

For each visitor, it draws one plausible rate for every screen from its belief, and shows whichever drew the biggest. Uncertain screens draw wild numbers and win sometimes; well-known ones draw close to what they are.
