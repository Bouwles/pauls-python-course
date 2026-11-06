---
id: learn-bptt
type: learn
title: Blame back through time
concept: rnns
dialogue:
  - neil.neutral: "My weights were trained the way the blackboard chain was: backwards. Only backwards through time."
code: |
  for factor in [0.5, 1.5]:             # what each hour back multiplies the blame by
      blame = 1.0
      for hour in range(10):
          blame = blame * factor
      print(factor, round(blame, 4))
---
To train an RNN, unroll it: hour 1, hour 2, and so on to the last, one long chain with the same weights at every link. Then backpropagation runs back along the chain, hour by hour, exactly as on the blackboard. That's **backpropagation through time**.

Each hour back, the blame is multiplied by that hour's slopes: the memory weight, and the slope of `tanh`. Multiply by a number below 1 ten times and almost nothing is left; above 1 and it explodes. The example shows both: `0.001` and `57.665`.

So a plain RNN learns little from hours long past: the blame has **vanished** by the time it gets there.

The usual mistake is thinking every hour gets an equal say. The recent hours get nearly all of it.
