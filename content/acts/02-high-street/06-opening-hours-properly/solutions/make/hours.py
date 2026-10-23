"""Opening hours for the High Street. Import it; don't copy it."""
from collections import Counter

DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


def day_name(when):
    """The short name of the day, like Sat, for a datetime."""
    return DAYS[when.weekday()]


def is_open(hours, when):
    """True if a shop with these hours is open at `when`."""
    times = hours.get(day_name(when))
    if times is None:
        return False
    opens, closes = times
    return opens <= when.hour < closes


def sign(hours):
    """Seven lines for the door, Monday first."""
    lines = []
    for day in DAYS:
        times = hours.get(day)
        if times is None:
            lines.append(f"{day} closed")
        else:
            opens, closes = times
            lines.append(f"{day} {opens} till {closes}")
    return lines


def busiest_day(visits):
    """The day name that comes up most in a list of datetimes, or None."""
    if len(visits) == 0:
        return None
    counts = Counter([day_name(visit) for visit in visits])
    return counts.most_common(1)[0][0]


if __name__ == "__main__":
    # Quick checks. Importers never see these.
    from datetime import datetime

    test_hours = {"Mon": (9, 17)}
    print(is_open(test_hours, datetime(2026, 3, 16, 9, 0)))   # Monday 9:00: True
    print(is_open(test_hours, datetime(2026, 3, 16, 17, 0)))  # Monday 17:00: False
    print(sign(test_hours))
