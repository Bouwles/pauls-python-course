# Workshop prices, in pence.

BASE_CHARGE = 300
URGENT_EXTRA = 5  # per hour, added to urgent jobs


def price(hours, urgent=False):
    rate = BASE_CHARGE + (URGENT_EXTRA if urgent else 0)
    return hours * rate
