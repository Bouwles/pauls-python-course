---
id: predict-greedy
type: predict
title: The greedy test
concept: bandits
dialogue:
  - caitlin.pleased: "Simpler still. Show whichever screen is doing best."
  - paul.thinking: "Best so far, you mean."
code: |
  def played(version, visitor):
      """The tally at the cabinet: 1 if the visitor played, 0 if they walked on."""
      if version == "waving crab":
          return 1 if visitor % 3 == 1 else 0   # one visitor in three
      return 1 if visitor % 5 == 0 else 0       # high-score table: one in five


  versions = ["high-score table", "waving crab"]
  estimates = [0.0, 0.0]
  counts = [0, 0]
  for visitor in range(300):
      choice = estimates.index(max(estimates))
      reward = played(versions[choice], visitor)
      counts[choice] += 1
      estimates[choice] += (reward - estimates[choice]) / counts[choice]

  print(counts)
question: "Every visitor is shown the screen with the best estimate so far. What does this print?"
options:
  - text: "[300, 0]"
    correct: true
    feedback: "Right. The first visitor plays, so the high-score table's estimate goes above 0.0. Visitors who walk on pull it down to a half, a third, but never to 0.0, where the untried screen sits. The waving crab is never shown, so its estimate never moves. Greedy can't find out what it doesn't try."
  - text: "[0, 300]"
    misconception: greedy-finds-best
    feedback: "The waving crab is better, but nothing in the loop knows that. It only knows estimates, and the waving crab's stays at 0.0 because nobody is ever shown it. Greedy can't discover a better version on its own."
  - text: "[2, 298]"
    misconception: greedy-switches-after-failure
    feedback: "The second visitor walks on, but that only pulls the estimate from 1.0 to 0.5. It's still above the waving crab's 0.0, so the next visitor sees the same screen. One bad result never drags an estimate below an untried version's zero."
---
This is a **multi-armed bandit**: several choices (the arms, here the screens), each paying off at its own unknown rate, and a limited number of tries. Each visitor teaches you about one arm only, the one they were shown.

`estimates` holds each screen's average so far: the share of the visitors shown it who played. Line 15 keeps it up to date without storing every visitor.

`index(max(...))` gives the first of the biggest, so ties go to the first screen.
