---
id: learn-model
type: learn
title: A guess with dials
concept: linear-regression
dialogue:
  - paul.neutral.point: "Every model on this floor is a guess with dials. This one has two."
code: |
  import numpy as np

  areas = np.array([100.0, 150.0, 200.0])    # floor areas, in square metres

  w = 3500        # dollars for each square metre
  b = -140000     # added to every price

  prices = w * areas + b
  print(prices)
---
A **model** is a rule that makes a guess. Paul's first one guesses a house's price from its floor area:

```text
price = w * area + b
```

Say it as "the price is `w` times the area, plus `b`". `w` and `b` are the model's two dials. `w` is how many dollars each square metre adds. `b` moves every guess up or down by the same amount.

Picture the sales as dots on a chart, area along the bottom and price up the side. The model is a ruler laid across them: `w` tilts it, and `b` slides it. A straight-line model like this is called **linear regression**.

The example guesses three houses at once and prints `[210000. 385000. 560000.]`.

The usual mistake is to think a model knows prices. It knows two numbers. Choosing them is called **fitting** the model.
