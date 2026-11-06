---
id: predict-nested
type: predict
title: Launch or wait?
concept: nested-conditions
code: |
  weather = "rain"
  wind = 5
  if weather == "clear":
      if wind < 20:
          print("Launch")
      else:
          print("Too windy")
  else:
      print("Wait for clear skies")
question: What does this print?
options:
  - text: Launch
    misconception: nested-if-runs-without-outer
    feedback: "The wind is only checked once the weather test has passed. `\"rain\" == \"clear\"` is `False`, so Python skips that whole block."
  - text: Too windy
    misconception: else-pairs-with-nearest-if
    feedback: "That `else` lines up with `if wind < 20`, inside the weather block. Python never got inside, so it never runs."
  - text: Wait for clear skies
    correct: true
    feedback: "Right. The weather test is `False`, so Python skips everything indented under it, and the outer `else` runs. The wind is never checked."
---
The same launch rules, on a rainy day with almost no wind. Follow the indents to see which `else` belongs to which `if`.
