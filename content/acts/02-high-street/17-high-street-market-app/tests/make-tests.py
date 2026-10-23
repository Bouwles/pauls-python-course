# Moss's stalls.py, the one the requirements describe. Your tests should pass on it.
REFERENCE = r'''"""The market's rules: stalls, bookings, and what is allowed.

No files and no printing in here. storage.py and cli.py do that.
"""
from dataclasses import dataclass
from datetime import date

MAX_STALLS_PER_TRADER = 2
SATURDAY = 5


class BookingError(Exception):
    """A booking or cancellation that breaks one of the market's rules."""


@dataclass(frozen=True)
class Stall:
    number: int
    size: str
    price: int


@dataclass(frozen=True)
class Booking:
    day: date
    stall: int
    trader: str


class Market:
    """Every stall, and every booking made for them."""

    def __init__(self, stalls: list[Stall],
                 bookings: list[Booking] | None = None):
        self.stalls = {stall.number: stall for stall in stalls}
        self.bookings = list(bookings) if bookings else []

    def bookings_on(self, day: date) -> list[Booking]:
        """That day's bookings, in stall order."""
        todays = [booking for booking in self.bookings if booking.day == day]
        return sorted(todays, key=lambda booking: booking.stall)

    def free_stalls(self, day: date) -> list[Stall]:
        """The stalls nobody has booked that day, in stall order."""
        taken = {booking.stall for booking in self.bookings_on(day)}
        return [self.stalls[number] for number in sorted(self.stalls)
                if number not in taken]

    def takings(self, day: date) -> int:
        """What that day's booked stalls pay, in pounds."""
        return sum(self.stalls[booking.stall].price
                   for booking in self.bookings_on(day))

    def book(self, day: date, number: int, trader: str) -> Booking:
        """Book a stall for a trader, or raise BookingError saying why not."""
        if day.weekday() != SATURDAY:
            raise BookingError("The market is only on Saturdays.")
        if number not in self.stalls:
            raise BookingError(f"There is no stall {number}.")
        todays = self.bookings_on(day)
        if any(booking.stall == number for booking in todays):
            raise BookingError(f"Stall {number} is already booked on {day}.")
        held = [booking for booking in todays if booking.trader == trader]
        if len(held) >= MAX_STALLS_PER_TRADER:
            raise BookingError(
                f"{trader} already has {len(held)} stalls on {day}."
            )
        booking = Booking(day, number, trader)
        self.bookings.append(booking)
        return booking

    def cancel(self, day: date, number: int, trader: str) -> None:
        """Remove a trader's booking, or raise BookingError if there's none."""
        booking = Booking(day, number, trader)
        if booking not in self.bookings:
            raise BookingError(
                f"{trader} has no booking for stall {number} on {day}."
            )
        self.bookings.remove(booking)
'''

# Seven copies of it, each with one rule broken. Your tests should fail on every one.
MUTANTS = {
    'double': ('if any(booking.stall == number for booking in todays):', 'if False:'),
    'limit': ('if len(held) >= MAX_STALLS_PER_TRADER:', 'if len(held) > MAX_STALLS_PER_TRADER:'),
    'saturday': ('if day.weekday() != SATURDAY:', 'if False:'),
    'unknown': ('if number not in self.stalls:', 'if False:'),
    'cancel': ('self.bookings.remove(booking)', 'pass'),
    'free': ('if number not in taken]', 'if True]'),
    'takings': ('return sum(self.stalls[booking.stall].price\n', 'return sum(1\n'),
}


def run_tests(ctx, stalls_source=None):
    """Run every test_ function in test_market.py. Gives back (names, failures)."""
    files = None if stalls_source is None else {"stalls.py": stalls_source}
    module = ctx.module(files=files)
    tests = sorted((name, test) for name, test in vars(module).items()
                   if name.startswith("test_") and callable(test))
    failures = []
    for name, test in tests:
        try:
            test()
        except Exception as error:
            failures.append(f"{name}: {type(error).__name__} {error}".strip())
    return [name for name, _ in tests], failures


def mutant(key):
    old, new = MUTANTS[key]
    return REFERENCE.replace(old, new)


def enough_tests(ctx):
    names, _ = run_tests(ctx)
    if len(names) < 6:
        raise CheckFailed("Write at least six test functions, each named test_ something.", expected="6 or more", actual=f"{len(names)}: {', '.join(names) or 'none'}")


def pass_on_yours(ctx):
    names, failures = run_tests(ctx)
    if failures:
        raise CheckFailed("Your tests should all pass on your own stalls.py. Either the test or the market is wrong.", expected="no failures", actual="; ".join(failures))


def pass_on_reference(ctx):
    names, failures = run_tests(ctx, REFERENCE)
    if failures:
        raise CheckFailed("These tests fail on a stall market that follows the requirements exactly.", expected="no failures", actual="; ".join(failures))


def catches(key, message):
    def check(ctx):
        names, failures = run_tests(ctx, mutant(key))
        if not failures:
            raise CheckFailed(message)
    return check


TESTS = [
    custom("At least six tests", enough_tests, visible=True),
    custom("Your tests pass on your market", pass_on_yours, visible=True),
    custom("Your tests agree with the requirements", pass_on_reference,
           hint="Test through book, cancel, free_stalls, bookings_on and takings, and expect exactly what the requirements say."),
    custom('Your tests catch a stall booked twice on one day', catches('double', 'None of your tests fails when two traders book the same stall on the same day.'),
           hint='Book a stall, then assert refused(lambda: ...) when someone else books it the same day.'),
    custom('Your tests catch a third stall for one trader', catches('limit', 'None of your tests fails when a trader gets a third stall on one day. Book two, then check the third is refused.'),
           hint='Book two stalls for one trader on one day, then assert the third is refused.'),
    custom('Your tests catch a booking on a weekday', catches('saturday', "None of your tests fails when a booking is made on a day that isn't a Saturday."),
           hint="Pick a date that isn't a Saturday, like date(2026, 11, 10), and assert booking on it is refused."),
    custom("Your tests catch a booking for a stall that doesn't exist", catches('unknown', 'None of your tests fails when someone books stall 13.'),
           hint="Assert that booking a stall number your market doesn't have is refused."),
    custom('Your tests catch a cancellation that does nothing', catches('cancel', 'None of your tests fails when cancel leaves the booking where it was. Cancel, then check the stall is free.'),
           hint='Book, cancel, then check the stall is back in free_stalls, or bookings_on is empty.'),
    custom('Your tests catch a booked stall still showing as free', catches('free', 'None of your tests fails when free_stalls lists every stall, booked or not.'),
           hint='Book one stall, then check free_stalls no longer includes it.'),
    custom('Your tests catch takings that count stalls, not pounds', catches('takings', 'None of your tests fails when takings counts the stalls instead of adding up their prices.'),
           hint='Book a stall or two, then assert takings equals what they cost in pounds.'),
]
