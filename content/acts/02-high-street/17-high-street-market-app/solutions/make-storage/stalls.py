"""The market's rules: stalls, bookings, and what is allowed.

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
