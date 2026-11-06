---
id: learn-features
type: learn
title: Readings a model can use
concept: feature-engineering
code: |
  import numpy as np
  import pandas as pd

  days = pd.DataFrame({
      "wind_speed": [15, 15, 10],
      "wind_dir": [350, 10, 180],          # where the wind comes from, in degrees
      "pressure": [1012.0, 1006.0, 1009.0],
  })

  angle = np.radians(days["wind_dir"])
  days["wind_east"] = (days["wind_speed"] * np.sin(angle)).round(1)
  days["wind_north"] = (days["wind_speed"] * np.cos(angle)).round(1)
  days["pressure_change"] = days["pressure"].diff()
  print(days)
---
A model can only find a pattern that's there in its columns. **Feature engineering** is rewriting the readings so it can see what they mean. A **feature** is any column the model is given.

A compass direction goes round: 350 and 10 are nearly the same wind, but 340 apart as numbers. Written as an arrow, it's two numbers that don't wrap: the push east, `speed * sin(angle)`, and the push north, `speed * cos(angle)`, with the angle in radians.

Some readings matter as a change. A skipper watches the pressure falling, not its level. `days["pressure"].diff()` is each day's pressure minus the day before's, with `NaN` on the first day.

The usual mistake is feeding raw readings in and expecting the model to work out what they mean.
