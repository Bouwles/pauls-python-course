---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.laughing: "I carried the Archive's barometer up the hill path once. Slowly. It fell the whole way."
  - paul.thinking.point: "Two links. Minutes give height, height gives pressure. The rates multiply."
code: |
  import math


  def height(minutes):                 # Paul on the hill path: 1.5 metres higher every minute
      return 1.5 * minutes


  def pressure(metres):                # hPa, thinner the higher you go
      return 1013 * math.exp(-metres / 8400)


  height_slope = 1.5                   # metres a minute


  def pressure_slope(metres):          # hPa a metre, at this height (from the Archive's handbook)
      return -1013 / 8400 * math.exp(-metres / 8400)


  minutes = 40.0
  metres = height(minutes)
  per_minute = pressure_slope(metres) * height_slope
  print(f"Worked out: {per_minute:.5f} hPa a minute")

  step = 1e-5
  measured = (pressure(height(minutes + step)) - pressure(height(minutes - step))) / (2 * step)
  print(f"Measured:   {measured:.5f} hPa a minute")
subgoals:
  - label: Each link as its own function
    lines: [4, 9]
  - label: Each link's slope
    lines: [12, 16]
  - label: Find the inner value
    lines: [19, 20]
  - label: Multiply the slopes, the outer one at the inner value
    lines: [21, 22]
  - label: Measure it to check
    lines: [24, 26]
explain:
  prompt: "Why does line 21 give `pressure_slope` the height, `metres`, and not `minutes`?"
  answer: "`pressure_slope` is how fast pressure changes per metre at a given height. After 40 minutes Paul is 60 metres up, so the slope that matters is the one at 60 metres. Passing 40 would give the slope 40 metres up, where Paul isn't."
  concept: chain-rule
---
When one thing depends on a second, and the second on a third, their rates multiply. Paul climbs 1.5 metres a minute; up there, pressure drops about 0.12 hPa a metre. So it drops about 1.5 times 0.12 hPa a minute. That's the **chain rule**:

```text
change per minute = (change per metre) * (metres per minute)
```

The outer slope, pressure per metre, is taken at the height Paul has reached. The last lines measure the whole chain by nudging the minutes either side, without knowing any of the algebra, and get the same answer. That's how you check a slope you worked out.
