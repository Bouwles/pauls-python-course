---
id: hill
type: concept
title: Finding the bottom
widget: hill-walker
params: { start: -2, rate: 0.1 }
concept: gradient-descent
dialogue:
  - paul.thinking.point: "Same valley as the example, bottom at 3. Walk it yourself."
---
The curve is the loss for every value of one dial, `x`. Each press of **Take a step** moves the point by the learning rate times the slope, downhill.

First reach the bottom with a rate of 0.5 or less, and watch the steps shrink as the slope flattens. Then press **Back to the start**, slide the rate above 1, and take a few steps. Watch the loss under the curve each time.
