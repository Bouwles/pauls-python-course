---
id: learn-ab-testing
type: learn
title: What a fair test costs
concept: ab-testing
code: |
  rates = [0.10, 0.17]   # the truth, known only in a simulation
  shown = [500, 500]

  best = max(rates)
  lost = 0
  for version in range(len(rates)):
      lost += shown[version] * (best - rates[version])
  print(round(lost, 1))
---
Caitlin's fair plan is an **A/B test**: show each version to a fixed share of visitors, then compare their rates at the end.

It's fair to the screens, but the visitors pay. Each visitor shown a weaker screen had less chance of playing. Add up those lost chances and you get the test's **regret**: the visitors it expects to lose, against showing everyone the best screen.

In words: for each version, the visitors shown it times the gap between the best rate and its rate, all added up. The example prints `35.0`: 500 visitors each lost 0.07.

Only a simulation knows the true rates, so only a simulation can count regret exactly. The usual mistake is thinking a fair test costs nothing.
