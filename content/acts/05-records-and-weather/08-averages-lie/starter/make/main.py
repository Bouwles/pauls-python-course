# The Clocktower station's year in numbers. 2024, day by day.
import pandas as pd


def summary(values):
    """The centre and spread of a Series of readings, as a dictionary."""


def fences(values):
    """The low and high fences: one and a half middle-halves beyond the quartiles."""
    # Find the quartiles

    # Measure the middle half

    # Set the fences, one and a half middles out


def outliers(values):
    """The readings outside the fences, with their labels."""
    # Keep what falls outside


def dry_days(rain, threshold=0.2):
    """How many days had less rain than the threshold."""


if __name__ == "__main__":
    daily = pd.read_csv("daily.csv", index_col="date")
    rain = summary(daily["rain"])
    print(f"Rain on an average day: {rain['mean']:.1f} mm. On the middle day: {rain['median']:.1f} mm.")
    print(f"Most common: {rain['mode']:.1f} mm. Dry days: {dry_days(daily['rain'])} of {len(daily)}")
    for place in ["temp", "thornby"]:
        numbers = summary(daily[place])
        name = "Clocktower" if place == "temp" else "Thornby"
        print(f"{name}: average {numbers['mean']:.1f} degrees C, standard deviation {numbers['std']:.1f}")
    print("Outside the fences:")
    for date, reading in outliers(daily["temp"]).items():
        print(f"  Clocktower, {date}: {reading} degrees C")
    print(f"  Thornby: {len(outliers(daily['thornby']))} readings")
    print(f"  Rain: {len(outliers(daily['rain']))} days")
