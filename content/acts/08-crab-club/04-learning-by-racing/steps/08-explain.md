---
id: explain
type: explain
title: The wobble
dialogue:
  - aaesha: "Monte Carlo agrees with the map. TD is further out, worst of all beside the rock."
  - aaesha: "Is TD simply worse? I'd like a reason, not a feeling."
prompt: "Your TD values with `alpha=0.05` are further from the map than Monte Carlo's, and more races wouldn't settle them. Why? And what would you change to make TD settle?"
answer: "Monte Carlo keeps a true running average: the nth return moves the estimate by 1/n, so old races keep their weight and the estimate settles. TD moves a fixed fraction, alpha, towards each new target, so it is always mostly the last few dozen races, and one slip into the pool still shoves it. Next to the rock, one step in ten ends in the pool, so the targets there jump about most. A smaller alpha wobbles less but learns more slowly; shrinking alpha over time, like 1/count, lets it settle. TD isn't worse: it learns during the race, and each update carries one step's luck rather than a whole race's."
concept: td-learning
---
Try it before you answer: run your program with `alpha=0.01` and 5000 races.
