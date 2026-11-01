---
id: make
type: make
title: Make the hill survey
on_pass: { paul.pleased.cheer: "Uphill from the gorse is 340, not straight at the top. Upstairs, we walk the other way." }
hints:
  nudge: "Which input does each partial slope nudge, and which does it hold still? And for `miss_slopes`, what is the inner value, and what is the outer function done to it?"
  plan:
    - Nudge the input a step either side, and divide by the distance between the two
    - Do that for east with north held still, then for north with east held still
    - Make an arrow of the two slopes, then find its bearing and its length
    - Find the inner value
    - Each link's slope
    - Multiply the slopes, the outer one at the inner value
  shape: |
    def slope(f, x, step=1e-5):
        return (f(x + step) - f(___)) / (___)


    def partial_slopes(f, east, north, step=1e-5):
        east_slope = (f(east + step, ___) - f(east - step, ___)) / (2 * step)
        north_slope = ___
        return east_slope, north_slope


    def uphill(f, east, north):
        east_slope, north_slope = partial_slopes(f, east, north)
        bearing = math.degrees(math.atan2(___, ___)) % 360
        return bearing, math.hypot(___, ___)


    def miss_slopes(gain, offset, reading, true):
        miss = ___
        square_slope = 2 * ___
        return square_slope * ___, square_slope * ___
---
Write Paul's four functions. The hill's survey, the path and the report are done.

```
Steepest on the path: 650 m from the gate, slope 0.243, about 1 in 4
At the top: slopes 0.000 east, 0.000 north
From the gorse: straight uphill is 340 degrees, slope 0.212
Thermometer check (reads 8.5, should be 10.0):
  gain slope -25.5: turn the gain up
  offset slope -3.0: turn the offset up
```

The two partial slopes of the hill make an arrow, `(east_slope, north_slope)`, that points straight uphill, and its length is how steep that is. `math.atan2` and `math.hypot` do for single numbers what `np.arctan2` and `np.linalg.norm` did for arrays.

`miss_slopes` is worked out with the chain rule, like Paul's barometer, not measured: the checks measure it and compare.

The report calls `show_hill` once every 10 metres up the path. Press Run when it works and watch the walker climb, with the slope under its feet.
