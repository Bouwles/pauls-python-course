---
id: learn-perplexity
type: learn
title: How surprised is it?
concept: language-models
code: |
  import numpy as np

  chances = np.array([0.5, 0.25, 0.1, 0.5])       # the chance it gave each real next character
  average = -np.mean(np.log(chances))
  print(round(average, 3))
  print(round(float(np.exp(average)), 2))
---
To score a language model, run it over text it never learnt from, and look at the chance it gave each real next character. Take the average of minus the log of those chances, the cross-entropy from the digit reader.

Raise e to that average, `np.exp`, and you have the **perplexity**. It reads as how many characters the model is choosing between, as if it were picking evenly. Guessing evenly among 39 characters scores 39. In the example the chances average out at a perplexity of `3.56`: about as unsure as picking from three or four.

Lower is better, and 1 would mean it was always sure and always right.

The usual mistake is reading a bigger perplexity as better. It means more surprised.
