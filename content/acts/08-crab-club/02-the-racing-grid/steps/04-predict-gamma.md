---
id: predict-gamma
type: predict
title: Now or later
concept: returns-discounting
dialogue:
  - caitlin.pleased.point: "In my version, the crab can eat a crumb at the start line..."
  - caitlin.laughing: "...or race the full straight for the prize. Patience is a virtue, in crabs."
code: |
  def discounted_return(rewards, gamma):
      total = 0
      for t, reward in enumerate(rewards):
          total += gamma ** t * reward
      return total


  crumb = [2]                          # eat at the start line, race over
  straight = [0, 0, 0, 0, 0, 0, 10]   # six steps, then the finish

  for gamma in [0.1, 0.99]:
      if discounted_return(straight, gamma) > discounted_return(crumb, gamma):
          print(gamma, "straight")
      else:
          print(gamma, "crumb")
question: What does this print?
options:
  - text: |-
      0.1 crumb
      0.99 straight
    correct: true
    feedback: "Right. With gamma 0.1 the prize six steps away is worth 10 × 0.1 to the power 6, a hundred-thousandth: the crumb wins. With 0.99 it's still worth 9.4. Gamma decides how far ahead the crab looks, so it can change which choice is best, not only the size of the numbers."
  - text: |-
      0.1 straight
      0.99 straight
    misconception: gamma-only-scales
    feedback: "Discounting doesn't shrink every return by the same amount. The crumb comes first and isn't discounted at all; the prize is discounted six times. A small gamma crushes the prize and leaves the crumb alone."
  - text: |-
      0.1 straight
      0.99 crumb
    misconception: gamma-backwards
    feedback: "A small gamma discounts heavily: 0.1 to the sixth is tiny. A gamma near 1 hardly discounts at all. It's the short-sighted crab that takes the crumb."
---
`gamma` is between 0 and 1. Set it near 0 and only the next reward or two matter. Set it near 1 and the far future counts almost as much as now.
