---
id: make-features
type: make
title: Make the features
files: [features.py]
entry: features.py
timeout_ms: 30000
on_pass: { ferro: "Wind as an arrow, tide from dawn. Now it reads the sky the way a skipper does." }
hints:
  nudge: "Which columns are known at dawn, and which three of them need rewriting before a model can use what they mean?"
  plan:
    - Load the log
    - The wind as an arrow, not a compass number
    - High water, measured from dawn
    - The pressure's change since yesterday
    - What counts as a good day
    - Keep only complete rows, and only the dawn columns
  shape: |
    def add_features(days):
        days = days.copy()
        angle = np.radians(days["___"])
        days["wind_east"] = days["wind_speed"] * np.___(angle)
        days["wind_north"] = days["wind_speed"] * np.___(angle)
        days["from_dawn"] = (days["high_water"].apply(___) - 6).abs()
        days["pressure_change"] = days["pressure"].___()
        days["good"] = (days["boxes_per_boat"] >= ___).astype(int)
        return days


    def feature_table(days):
        complete = days.dropna(subset=___)
        return complete[___], complete["good"]
---
`features.py` is nearly empty. Write this, with pandas:

```text
FEATURES            the ten columns a dawn forecast may use, in this order:
                    wind_speed, wind_east, wind_north, pressure_change,
                    sea_temp, swell, tide_range, from_dawn, cloud, rain
load_days(path)     the log as a DataFrame, one row per day, in date order
hours(clock)        a clock time as hours after midnight: "06:42" is 6.7
add_features(days)  a new DataFrame (days itself unchanged) with five more:
  wind_east, wind_north   wind_speed times the sine, and the cosine, of
                          wind_dir in radians
  from_dawn               hours between the first high water and 06:00
  pressure_change         today's pressure minus yesterday's; missing on
                          the first day
  good                    1 if boxes_per_boat is 8 or more, else 0
feature_table(days)     (X, y): the FEATURES columns of every row with no
                        feature missing, and good for the same rows
```

Run as a program, it adds the features and prints:

```text
Days in the log: 1096
Days with every feature: 1095
Good days: 0.43
```
