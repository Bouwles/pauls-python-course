# Tide times for the north quay. A. Penhallow.
# I never wrote tests for the thing on the hill. It passes everything
# I ask it, which is either very good news or the worst kind. A.P.

TIDE_GAP = 12 * 60 + 25     # high water to the next high water, in minutes
EBB = 6 * 60 + 13           # high water to the low water after it
DAY = 24 * 60


def to_minutes(time):
    """'06:42' -> 402, minutes after midnight."""
    hours, mins = time.split(":")
    return int(hours) * 60 + int(mins)


def to_clock(minutes):
    """402 -> '06:42'. Times past midnight wrap round to the next morning."""
    minutes = minutes % DAY
    return f"{minutes // 60:02}:{minutes % 60:02}"


def next_high(high):
    """The high water after this one."""
    return to_clock(to_minutes(high) + TIDE_GAP)


def low_after(high):
    """The low water after a high water."""
    return to_clock(to_minutes(high) + EBB)


def can_cross(depth, draught, margin=0.5):
    """True when a boat drawing `draught` metres can cross the bar at `depth` metres.

    The depth must be at least the draught plus the margin.
    """
    return depth >= draught + margin


def high_waters(first, count):
    """A list of count high water times, starting with first."""
    times = []
    high = first
    while len(times) < count:
        times.append(high)
        high = next_high(high)
    return times
