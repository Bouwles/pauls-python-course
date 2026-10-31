# The Clocktower station's year in numbers. 2024, day by day.
import pandas as pd


def summary(values):
    """The centre and spread of a Series of readings, as a dictionary."""
    return {
        "mean": values.mean(),
        "median": values.median(),
        # mode() gives every value that ties for most common, smallest first.
        "mode": values.mode().iloc[0],
        "std": values.std(),
        "q1": values.quantile(0.25),
        "q3": values.quantile(0.75),
    }


def fences(values):
    """The low and high fences: one and a half middle-halves beyond the quartiles."""
    # Find the quartiles
    q1 = values.quantile(0.25)
    q3 = values.quantile(0.75)
    # Measure the middle half
    middle_half = q3 - q1
    # Set the fences, one and a half middles out
    return q1 - 1.5 * middle_half, q3 + 1.5 * middle_half


def outliers(values):
    """The readings outside the fences, with their labels."""
    # Keep what falls outside
    low, high = fences(values)
    return values[(values < low) | (values > high)]


def dry_days(rain, threshold=0.2):
    """How many days had less rain than the threshold."""
    return int((rain < threshold).sum())


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
