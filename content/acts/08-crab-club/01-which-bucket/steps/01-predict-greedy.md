---
id: predict-greedy
type: predict
title: The greedy test
concept: bandits
dialogue:
  - riya: "Simpler still. Hand out whichever flyer is doing best."
  - paul: "Best so far, you mean."
code: |
  def came_in(version, visitor):
      """The tally at the door: 1 if the visitor came in, 0 if they walked on."""
      if version == "beat the crab":
          return 1 if visitor % 3 == 1 else 0   # one visitor in three
      return 1 if visitor % 5 == 0 else 0       # three goes for a pound: one in five


  versions = ["three goes for a pound", "beat the crab"]
  estimates = [0.0, 0.0]
  counts = [0, 0]
  for visitor in range(300):
      choice = estimates.index(max(estimates))
      reward = came_in(versions[choice], visitor)
      counts[choice] += 1
      estimates[choice] += (reward - estimates[choice]) / counts[choice]

  print(counts)
question: "Every visitor is handed the flyer with the best estimate so far. What does this print?"
options:
  - text: "[300, 0]"
    correct: true
    feedback: "Right. The first visitor comes in, so three goes for a pound's estimate goes above 0.0. Visitors who walk on pull it down to a half, a third, but never to 0.0, where the untried flyer sits. Beat the crab is never handed out, so its estimate never moves. Greedy can't find out what it doesn't try."
  - text: "[0, 300]"
    misconception: greedy-finds-best
    feedback: "Beat the crab is better, but nothing in the loop knows that. It only knows estimates, and beat the crab's stays at 0.0 because nobody is ever handed it. Greedy can't discover a better version on its own."
  - text: "[2, 298]"
    misconception: greedy-switches-after-failure
    feedback: "The second visitor walks on, but that only pulls the estimate from 1.0 to 0.5. It's still above beat the crab's 0.0, so the next visitor gets the same flyer. One bad result never drags an estimate below an untried version's zero."
---
This is a **multi-armed bandit**: several choices (the arms, here the flyers), each paying off at its own unknown rate, and a limited number of tries. Each visitor teaches you about one arm only, the one they were handed.

`estimates` holds each flyer's average so far: the share of the visitors handed it who came in. Line 15 keeps it up to date without storing every visitor.

`index(max(...))` gives the first of the biggest, so ties go to the first flyer.
