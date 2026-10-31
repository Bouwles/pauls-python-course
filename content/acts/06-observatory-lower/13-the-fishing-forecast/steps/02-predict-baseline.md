---
id: predict-baseline
type: predict
title: Eighty-eight in a hundred
concept: baselines
dialogue:
  - caitlin: "This gale model I found is right eighty-eight days in a hundred. That's brilliant."
  - aaesha: "Is it. Compared with what?"
code: |
  import numpy as np

  rng = np.random.default_rng(2)
  gale = (rng.random(365) < 0.1).astype(int)    # a gale on about one day in ten

  gale_model = 0.88                           # the gale model's accuracy
  always_calm = np.mean(gale == 0)
  print(round(always_calm, 2))
  print("the model" if gale_model > always_calm else "always calm")
question: "Which is right more often: the gale model, or saying \"calm\" every single day?"
options:
  - text: |-
      0.91
      always calm
    correct: true
    feedback: "Right. With gales on one day in ten, saying calm every day is right nine days in ten, without looking at a single reading. Eighty-eight sounds good and is worse than doing nothing."
  - text: |-
      0.5
      the model
    misconception: baseline-is-a-coin
    feedback: "A coin toss is the baseline only when both answers are equally common. Here calm days outnumber gales nine to one, so always guessing calm is right about nine times in ten."
  - text: |-
      0.88
      the model
    misconception: accuracy-without-baseline
    feedback: "Accuracy means nothing until you know what doing nothing scores. Always saying calm gets 0.91 here, so the model, at 0.88, has learnt less than nothing."
after: |
  Run it. Then change the 0.1 to 0.5, so gales are as common as calm days, and run it again.
---
A **baseline** is the simplest forecast that could possibly work: always the commonest answer, tomorrow the same as today, or the rule the old hands use. A model is only worth having if it beats them, on the same days.
