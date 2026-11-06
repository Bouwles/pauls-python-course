---
id: predict-cost
type: predict
title: A quarter each
concept: ab-testing
dialogue:
  - caitlin.neutral: "The fair way, then. A quarter each, and we count them at the end."
  - paul.thinking: "Count what it costs, while you're at it."
code: |
  rates = [0.10, 0.14, 0.08, 0.17]   # the truth, which nobody at the cabinet knows
  shown = [250, 250, 250, 250]       # the plain A/B test: 1000 visitors, a quarter each

  best = max(rates)
  lost = 0
  for version in range(len(rates)):
      lost += shown[version] * (best - rates[version])

  print(f"{lost:.1f}")
question: What does this print?
options:
  - text: "47.5"
    correct: true
    feedback: "Right. Each visitor shown a weaker screen costs the gap between its rate and the best one: 250 visitors at 0.07, 250 at 0.03, 250 at 0.09 and 250 at nothing. That total is the test's regret."
  - text: "0.0"
    misconception: fair-test-is-free
    feedback: "The test is fair to the screens, not to the visitors. Each of the 250 shown the flashing coin had a worse chance of playing than with the waving crab. Line 7 charges every one of them the difference."
  - text: "90.0"
    misconception: regret-uses-worst-gap
    feedback: "That's all 1000 visitors charged the gap between the best and the worst screen, 0.09. Only the 250 shown the worst one cost that much. Each version's visitors cost its own gap, and the 250 shown the best cost nothing."
after: |
  Run it. Then make it 500 visitors each. The cost doubles: a fair test keeps paying for its losers until the day it ends.
---
Caitlin's real plan: four screens, 1000 visitors, a quarter each. Line 1 holds the true rates, which nobody at the cabinet knows. Work out what each version's 250 visitors cost, then add them up.
