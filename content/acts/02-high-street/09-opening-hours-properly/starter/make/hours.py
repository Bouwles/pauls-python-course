"""Opening hours for every floor of the Clocktower. Import it; don't copy it."""

DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


def is_open(hours, when):
    # Turn when.weekday() into a day name with DAYS: Monday is 0
    # No hours for that day: closed
    # Open from the opening hour, closed from the closing hour
    pass


def sign(hours):
    # One line per day, Monday first
    pass


def busiest_day(visits):
    # No visits: no busiest day
    # Count the day names with Counter, and take the most common
    pass


# Quick checks under the main guard, for when this file is run on its own
