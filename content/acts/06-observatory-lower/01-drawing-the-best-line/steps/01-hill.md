---
id: hill
type: concept
title: Finding the bottom
widget: hill-walker
params: { start: -2, rate: 0.1 }
concept: gradient-descent
dialogue:
  - wendt: "Every line has a number for how wrong it is. We call it the loss."
  - wendt: "Try every possible line and the losses make a hill. A valley, really. We want the bottom."
---
The curve is the loss for every value of one setting, `x`. The walker can't see the whole hill, only the slope under its feet. So it does the one sensible thing: it steps downhill, by the **learning rate** times the slope.

A steep slope means a long stride. Near the bottom the slope flattens, so the strides shrink on their own, without anyone telling them to.

That's **gradient descent**. The gradient is the slope; the descent is the walking.

Take a few steps. Then find out what the learning rate does: reach the bottom with a small rate, then go back to the start and try one above 1.
