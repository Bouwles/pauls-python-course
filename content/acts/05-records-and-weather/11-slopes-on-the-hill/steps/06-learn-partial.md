---
id: learn-partial
type: learn
title: A slope for each way you face
concept: derivatives
code: |
  def hill(east, north):
      return 0.1 * east + 0.3 * north


  step = 1e-5
  east_slope = (hill(1 + step, 2) - hill(1 - step, 2)) / (2 * step)
  north_slope = (hill(1, 2 + step) - hill(1, 2 - step)) / (2 * step)
  print(round(east_slope, 3), round(north_slope, 3))
---
A hill's height depends on two things: how far east you are, and how far north. So at each point it has two slopes: one as you step east with north held still, and one as you step north with east held still. Each is a **partial derivative**.

Picture standing on the hillside facing east, then turning to face north. The ground rises at a different rate each way.

To measure one, nudge only that input, a small step either side, and leave the other exactly where it is. The example's hill climbs gently eastwards and steeply northwards. It prints `0.1 0.3`.

The usual slip is to nudge both inputs at once. That measures a diagonal, which is neither slope.
