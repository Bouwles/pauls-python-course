# The Archive's wind vane, for Aaesha and for Riya's ride in.
import numpy as np

BIKE_HEADING = 40  # Riya's ride to the Clocktower, in degrees


def load_vane(path):
    """Read the vane log. Returns (dates, bearings, speeds): one of each per day."""
    # Averaging bearings is wrong whenever the wind sits near north, which in
    # January is always: 350 and 10 average to 180, due south.
    dates = np.loadtxt(path, delimiter=",", skiprows=1, usecols=0, dtype=str)
    readings = np.loadtxt(path, delimiter=",", skiprows=1, usecols=(1, 2))
    return dates, readings[:, 0], readings[:, 1]


def to_arrows(bearings, speeds):
    """One arrow per reading, (east, north) in knots, pointing where the wind came from."""
    angles = np.radians(bearings)
    return np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])


def to_bearings(arrows):
    """The compass bearing of each arrow (one per row), from 0 up to 360."""


def prevailing(arrows):
    """The average wind, as (bearing, speed): the mean arrow's direction and length."""


def steadiness(arrows):
    """The mean arrow's length over the mean speed: 1 if the wind never changed direction."""


def angle_between(a, b):
    """The angle between two arrows, in degrees, from 0 to 180."""


def along_and_across(arrows, heading):
    """For a bike on this heading, one row per wind: (headwind, crosswind from the right)."""
    # One-knot arrows for the new directions

    # Stack them into a matrix

    # Move every arrow with one @


if __name__ == "__main__":
    dates, bearings, speeds = load_vane("vane.csv")
    arrows = to_arrows(bearings, speeds)
    bearing, speed = prevailing(arrows)
    print(f"January 2024: {len(dates)} days")
    print(f"Average of the bearings: {bearings.mean():.0f} degrees")
    print(f"Prevailing wind: from {bearing:.0f} degrees at {speed:.1f} knots")
    print(f"Steadiness: {steadiness(arrows):.2f}")
    swings = [angle_between(arrows[day], arrows[day + 1]) for day in range(len(dates) - 1)]
    biggest = int(np.argmax(swings))
    print(f"Biggest swing overnight: {swings[biggest]:.0f} degrees, {dates[biggest]} to {dates[biggest + 1]}")
    winds = along_and_across(arrows, BIKE_HEADING)
    head = winds[:, 0].argmax()
    cross = np.abs(winds[:, 1]).argmax()
    print(f"Cycling on {BIKE_HEADING:03d}: worst headwind {winds[head, 0]:.1f} knots on {dates[head]}")
    print(f"Cycling on {BIKE_HEADING:03d}: worst crosswind {abs(winds[cross, 1]):.1f} knots on {dates[cross]}")
