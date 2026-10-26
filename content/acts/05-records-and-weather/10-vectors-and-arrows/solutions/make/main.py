# The station's wind vane, for Priya Lund and Captain Ferro.
import numpy as np

FERRY_HEADING = 40  # Captain Ferro's crossing, in degrees


def load_vane(path):
    """Read the vane log. Returns (dates, bearings, speeds): one of each per day."""
    # Averaging bearings: wrong whenever the wind sits near north, which in
    # January is always. I found out after the machine on the hill had learnt
    # from a winter of it. It thinks January blows from the south. Every boat
    # in the harbour was facing north. It didn't look. A.P.
    dates = np.loadtxt(path, delimiter=",", skiprows=1, usecols=0, dtype=str)
    readings = np.loadtxt(path, delimiter=",", skiprows=1, usecols=(1, 2))
    return dates, readings[:, 0], readings[:, 1]


def to_arrows(bearings, speeds):
    """One arrow per reading, (east, north) in knots, pointing where the wind came from."""
    angles = np.radians(bearings)
    return np.column_stack([speeds * np.sin(angles), speeds * np.cos(angles)])


def to_bearings(arrows):
    """The compass bearing of each arrow (one per row), from 0 up to 360."""
    # arctan2 takes east first: a bearing is measured from north, towards east.
    return np.degrees(np.arctan2(arrows[:, 0], arrows[:, 1])) % 360


def prevailing(arrows):
    """The average wind, as (bearing, speed): the mean arrow's direction and length."""
    mean_arrow = arrows.mean(axis=0)
    bearing = np.degrees(np.arctan2(mean_arrow[0], mean_arrow[1])) % 360
    return bearing, np.linalg.norm(mean_arrow)


def steadiness(arrows):
    """The mean arrow's length over the mean speed: 1 if the wind never changed direction."""
    return np.linalg.norm(arrows.mean(axis=0)) / np.linalg.norm(arrows, axis=1).mean()


def angle_between(a, b):
    """The angle between two arrows, in degrees, from 0 to 180."""
    cosine = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    # Rounding can push the cosine a hair past 1, and arccos(1.0000000002) is nan.
    return np.degrees(np.arccos(np.clip(cosine, -1, 1)))


def along_and_across(arrows, heading):
    """For a boat on this heading, one row per wind: (headwind, crosswind from starboard)."""
    angle = np.radians(heading)
    ahead = [np.sin(angle), np.cos(angle)]
    starboard = [np.cos(angle), -np.sin(angle)]  # a quarter turn clockwise from ahead
    frame = np.array([ahead, starboard])
    return arrows @ frame.T


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
    winds = along_and_across(arrows, FERRY_HEADING)
    head = winds[:, 0].argmax()
    cross = np.abs(winds[:, 1]).argmax()
    print(f"Ferry on {FERRY_HEADING:03d}: worst headwind {winds[head, 0]:.1f} knots on {dates[head]}")
    print(f"Ferry on {FERRY_HEADING:03d}: worst crosswind {abs(winds[cross, 1]):.1f} knots on {dates[cross]}")
