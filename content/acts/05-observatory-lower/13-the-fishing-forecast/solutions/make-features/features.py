"""The fleet's log, turned into what a dawn forecast can use."""
# Copied by Professor Wendt from the back of the fleet's catch book:
# The machine on the hill forecast the fishing better than the fleet for
# three winters running. Then the fish moved. It took the machine a
# season to notice, and Captain Ferro one morning. A.P.

import numpy as np
import pandas as pd

FEATURES = ["wind_speed", "wind_east", "wind_north", "pressure_change", "sea_temp",
            "swell", "tide_range", "from_dawn", "cloud", "rain"]


def load_days(path):
    return pd.read_csv(path)


def hours(clock):
    hour, minute = clock.split(":")
    return int(hour) + int(minute) / 60


def add_features(days):
    days = days.copy()
    # The wind as an arrow, not a compass number
    angle = np.radians(days["wind_dir"])
    days["wind_east"] = days["wind_speed"] * np.sin(angle)
    days["wind_north"] = days["wind_speed"] * np.cos(angle)
    # High water, measured from dawn
    days["from_dawn"] = (days["high_water"].apply(hours) - 6).abs()
    # The pressure's change since yesterday
    days["pressure_change"] = days["pressure"].diff()
    # What counts as a good day
    days["good"] = (days["boxes_per_boat"] >= 8).astype(int)
    return days


def feature_table(days):
    complete = days.dropna(subset=FEATURES)
    return complete[FEATURES], complete["good"]


if __name__ == "__main__":
    days = add_features(load_days("fishing.csv"))
    X, y = feature_table(days)
    print(f"Days in the log: {len(days)}")
    print(f"Days with every feature: {len(X)}")
    print(f"Good days: {y.mean():.2f}")
