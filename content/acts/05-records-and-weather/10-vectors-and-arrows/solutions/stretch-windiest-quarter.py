import numpy as np

QUARTERS = ["north", "east", "south", "west"]


def to_bearings(arrows):
    return np.degrees(np.arctan2(arrows[:, 0], arrows[:, 1])) % 360


def strongest_quarter(arrows):
    """The quarter of the compass whose winds had the highest average speed."""
    # Adding 45 puts 315 to 45 together as quarter 0, north.
    quarters = ((to_bearings(arrows) + 45) % 360 // 90).astype(int)
    speeds = np.linalg.norm(arrows, axis=1)
    best = None
    for number, name in enumerate(QUARTERS):
        if (quarters == number).any():
            average = speeds[quarters == number].mean()
            if best is None or average > best[0]:
                best = (average, name)
    return best[1]
