"""Tests for the market's rules. Run this file to run them all."""
from datetime import date

from stalls import Booking, BookingError, Market, Stall

SATURDAY = date(2026, 11, 7)


def small_market():
    """Three stalls and no bookings: a fresh market for every test."""
    return Market([
        Stall(1, "small", 12),
        Stall(2, "small", 12),
        Stall(3, "large", 20),
    ])


def refused(action):
    """True if calling action() raises BookingError."""
    try:
        action()
    except BookingError:
        return True
    return False


def test_booking_a_free_stall():
    market = small_market()
    market.book(SATURDAY, 1, "Sanjay")
    assert market.bookings_on(SATURDAY) == [Booking(SATURDAY, 1, "Sanjay")]


# At least one test for each rule. For a refusal:
#     assert refused(lambda: market.book(...))


if __name__ == "__main__":
    tests = [test for name, test in sorted(globals().items())
             if name.startswith("test_")]
    failed = 0
    for test in tests:
        try:
            test()
        except Exception as error:
            failed += 1
            print(f"FAILED {test.__name__}: {error!r}")
    print(f"{len(tests) - failed} passed, {failed} failed")
