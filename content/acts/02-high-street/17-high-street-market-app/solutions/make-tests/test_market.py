"""Tests for the market's rules. Run this file to run them all."""
from datetime import date

from stalls import Booking, BookingError, Market, Stall

SATURDAY = date(2026, 11, 7)
NEXT_SATURDAY = date(2026, 11, 14)
TUESDAY = date(2026, 11, 10)


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


def test_saturdays_only():
    market = small_market()
    assert refused(lambda: market.book(TUESDAY, 1, "Bea"))


def test_no_stall_thirteen():
    market = small_market()
    assert refused(lambda: market.book(SATURDAY, 13, "Bea"))


def test_one_booking_per_stall_per_day():
    market = small_market()
    market.book(SATURDAY, 1, "Sanjay")
    assert refused(lambda: market.book(SATURDAY, 1, "Gwen"))


def test_same_stall_next_week_is_fine():
    market = small_market()
    market.book(SATURDAY, 1, "Sanjay")
    market.book(NEXT_SATURDAY, 1, "Gwen")
    assert market.bookings_on(NEXT_SATURDAY) == [
        Booking(NEXT_SATURDAY, 1, "Gwen")
    ]


def test_two_stalls_each_and_no_more():
    market = small_market()
    market.book(SATURDAY, 1, "Bea")
    market.book(SATURDAY, 2, "Bea")
    assert refused(lambda: market.book(SATURDAY, 3, "Bea"))


def test_cancelling_frees_the_stall():
    market = small_market()
    market.book(SATURDAY, 3, "Bea")
    market.cancel(SATURDAY, 3, "Bea")
    assert Stall(3, "large", 20) in market.free_stalls(SATURDAY)


def test_only_the_trader_can_cancel():
    market = small_market()
    market.book(SATURDAY, 1, "Sanjay")
    assert refused(lambda: market.cancel(SATURDAY, 1, "Gwen"))


def test_booked_stall_is_not_free():
    market = small_market()
    market.book(SATURDAY, 2, "Gwen")
    numbers = [stall.number for stall in market.free_stalls(SATURDAY)]
    assert numbers == [1, 3]


def test_takings_count_pounds():
    market = small_market()
    market.book(SATURDAY, 1, "Sanjay")
    market.book(SATURDAY, 3, "Bea")
    assert market.takings(SATURDAY) == 32


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
