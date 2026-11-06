---
id: learn-bias
type: learn
title: Who is it wrong about?
concept: model-bias
code: |
  import numpy as np

  group = np.array(["city"] * 6 + ["outside"] * 3)
  came = np.array([1, 1, 0, 1, 0, 1, 1, 1, 1])
  kept = np.array([1, 1, 0, 1, 0, 1, 0, 0, 1])     # the model's guess: will they come?

  print("Everyone:", round(np.mean(kept == came), 2))
  for name in ["city", "outside"]:
      mine = group == name
      came_here = mine & (came == 1)
      print(name, round(np.mean(kept[mine] == came[mine]), 2), round(np.mean(kept[came_here] == 0), 2))
---
A model can be accurate overall and much worse for one group of people, usually a group it saw little of or one whose pattern differs. That's **model bias**. One overall score hides it, because the bigger group swamps the smaller.

So score each group on its own, with a mask like `group == name`. Then look hardest at the mistake that costs someone: here, being guessed a no-show when you came, and losing your slot. Count it among the people it could happen to: those who came.

In the example the model is right `0.78` of the time overall, and about every city visitor. Outside the city it's right a third of the time, and two in three who came would lose their slot.

The usual mistake is trusting the overall score to be fair.
