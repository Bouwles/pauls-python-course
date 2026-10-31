---
id: predict-cost
type: predict
title: What a fair test costs
concept: ab-testing
dialogue:
  - riya: "The fair way, then. A quarter each, and we count them at the end."
  - paul: "Count what it costs, while you're at it."
code: |
  rates = [0.10, 0.14, 0.08, 0.17]   # the truth, which nobody at the door knows
  handed_out = [250, 250, 250, 250]  # the plain A/B test: 1000 visitors, a quarter each

  best = max(rates)
  lost = 0
  for version in range(len(rates)):
      lost += handed_out[version] * (best - rates[version])

  print(f"{lost:.1f}")
question: "Compared with handing every visitor the best flyer, how many visitors does the fair test expect to lose?"
options:
  - text: "47.5"
    correct: true
    feedback: "Right. Each visitor handed a weaker flyer costs the gap between its rate and the best one: 250 visitors at 0.07, 250 at 0.03, 250 at 0.09 and 250 at nothing. That total is the test's **regret**: what it cost, against knowing the answer from the start."
  - text: "0.0"
    misconception: fair-test-is-free
    feedback: "The test is fair to the flyers, not to the visitors. Each of the 250 handed the free go after six had a worse chance of coming in than with Beat the crab. Line 7 charges every one of them the difference."
  - text: "90.0"
    misconception: regret-uses-worst-gap
    feedback: "That's all 1000 visitors charged the gap between the best and the worst flyer, 0.09. Only the 250 handed the worst one cost that much. Each version's visitors cost its own gap, and the 250 handed the best cost nothing."
after: |
  Run it. Then make it 500 visitors each. The cost doubles: a fair test keeps paying for its losers until the day it ends.
---
Riya's fair test is an **A/B test**: hand each version to a fixed share of visitors, then compare their rates at the end. A real one hands out at random, so nothing like the weather can favour one version; here every visitor is alike, so taking turns does the same job.

In a simulation you know the true rates, so you can count exactly what a test costs.
