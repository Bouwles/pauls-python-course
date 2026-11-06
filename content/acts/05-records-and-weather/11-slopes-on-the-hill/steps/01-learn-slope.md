---
id: learn-slope
type: learn
title: How steep, right here
concept: derivatives
dialogue:
  - paul.neutral.wave: "Next floor up is mine. Training a model is walking downhill. So first: hills."
code: |
  def height(metres):
      return 0.0001 * metres ** 2      # a lane that gets steeper as it climbs


  tiny = 0.001
  for metres in [100, 300]:
      rise = height(metres + tiny) - height(metres)
      print(metres, round(rise / tiny, 2))
---
The **slope** of a path at a point is how much it rises for each metre you walk there. Rise over run, as on a road sign: a slope of 0.25 is 1 in 4. Downhill is negative, and flat is 0.

On a curved path the slope changes as you go. To find it at one point, take a step so tiny that the path is straight across it, and divide the rise by the step. That rate of change is the **derivative**.

The example measures a lane that steepens as it climbs. At 100 metres along it prints `0.02`, and at 300, `0.06`.

The usual slip is to answer with the height. How high you are says nothing about how steep it is there.
