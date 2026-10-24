---
id: predict-partial
type: predict
title: East, then north
concept: derivatives
dialogue:
  - wendt: "A hill isn't a lane. It has a slope for every way you face. Well, two, and the rest follow."
code: |
  def hill(east, north):
      return 100 - 0.001 * east ** 2 - 0.002 * north ** 2     # metres; the top is at (0, 0)


  tiny = 1e-6
  east, north = 100.0, 100.0
  east_slope = (hill(east + tiny, north) - hill(east - tiny, north)) / (2 * tiny)
  north_slope = (hill(east, north + tiny) - hill(east, north - tiny)) / (2 * tiny)
  print(round(east_slope, 3), round(north_slope, 3))
question: What does this print?
options:
  - text: "-0.2 -0.4"
    correct: true
    feedback: "Right. Each line nudges one direction and holds the other still. The hill falls away twice as fast to the north as to the east, so the two slopes differ."
  - text: "-0.2 -0.2"
    misconception: one-slope-per-point
    feedback: "A hill has a different slope for each way you face. Here the ground drops away faster northwards: `0.002` against `0.001`. Facing east it falls 0.2 metres a metre; facing north, 0.4."
  - text: "-0.6 -0.6"
    misconception: partial-moves-everything
    feedback: "-0.6 is what you'd get stepping east and north at once, a diagonal that belongs to neither. Each line here moves one setting only: `east_slope` changes `east` and leaves `north` alone."
  - text: "70.0 70.0"
    misconception: slope-is-value
    feedback: "70 metres is how high the ground is at (100, 100). The slopes are how fast that height changes as you step east, or north."
after: |
  Run it. Then try the top, `east, north = 0.0, 0.0`, and predict both slopes first.
---
A hill's height depends on two things: how far east you are, and how far north. So it has two slopes at each point: the slope as you step east with north held still, and the slope as you step north with east held still. Each is a **partial derivative**.

To measure one, nudge only that input, a tiny step either side.
