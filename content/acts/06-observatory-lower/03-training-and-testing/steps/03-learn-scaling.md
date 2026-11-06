---
id: learn-scaling
type: learn
title: Every column the same size
concept: feature-scaling
code: |
  import numpy as np

  # Open days: visitors, and rain in mm
  X = np.array([[310, 0.0],
                [120, 8.5],
                [250, 2.0],
                [400, 0.5]])

  means = X.mean(axis=0)
  spreads = X.std(axis=0)
  scaled = (X - means) / spreads
  print(scaled.round(2))
  print(scaled.std(axis=0))
---
Columns come in their own units. Visitors to an open day run into hundreds; rain is a few millimetres. In the House Price Predictor, big numbers made a steep hill, so a rate that suits the rain would overshoot on the visitors.

**Standardising** puts every column on the same scale. Take away the column's mean, then divide by its standard deviation, its spread. Every column ends up centred on 0 with a spread of 1, whatever its units, and one learning rate suits every weight. `axis=0` gives one mean and one spread per column.

The example prints the scaled table, then each column's new spread: `[1. 1.]`.

The usual mistake is scaling a new row with its own mean and spread. It must use the means and spreads of the rows the model learnt from: the same ruler.
