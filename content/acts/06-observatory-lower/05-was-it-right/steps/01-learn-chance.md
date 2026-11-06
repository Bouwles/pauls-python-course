---
id: learn-chance
type: learn
title: Yes or no, as a chance
concept: logistic-regression
dialogue:
  - paul.neutral.point: "Not a number this time. A yes or a no, and how sure."
code: |
  import numpy as np

  # Eight respondents: 1 for diabetes or prediabetes, 0 for none
  diabetes = np.array([0, 0, 0, 1, 0, 1, 1, 1])
  print(np.mean(diabetes))

  chance = 0.27       # a model's chance of yes, for one respondent
  print(f"{chance:.0%}")
---
Some questions have a yes-or-no answer: does this respondent have diabetes? Write yes as 1 and no as 0. Then the mean of the column is the share of yeses: the example's eight respondents print `0.5`.

A model for a yes-or-no answer is a **classifier**. The useful ones don't just say yes or no. They give a **chance**: a number from 0 to 1. A chance of 0.27 means that of 100 respondents like this one, about 27 would have it. `:.0%` in an f-string prints it as `27%`.

The usual mistake is reaching for the straight line from the house prices and calling its answer a chance. A line goes on forever, and a chance has to stay between 0 and 1.
