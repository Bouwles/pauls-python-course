"""Reading and writing the market's files. The rules live in stalls.py."""
import csv
from datetime import date

from stalls import Booking, Stall

BOOKING_COLUMNS = ["day", "stall", "trader"]


def load_stalls(path: str) -> list[Stall]:
    """Every stall in a CSV file with columns number, size, price."""
    with open(path, newline="") as stalls_file:
        return [
            Stall(int(row["number"]), row["size"], int(row["price"]))
            for row in csv.DictReader(stalls_file)
        ]


def load_bookings(path: str) -> list[Booking]:
    """Every booking in a CSV file with columns day, stall, trader.

    A file that isn't there yet means no bookings yet.
    """
    try:
        with open(path, newline="") as bookings_file:
            return [
                Booking(date.fromisoformat(row["day"]), int(row["stall"]),
                        row["trader"])
                for row in csv.DictReader(bookings_file)
            ]
    except FileNotFoundError:
        return []


def save_bookings(path: str, bookings: list[Booking]) -> None:
    """Write every booking, sorted by day and then stall, under a header."""
    in_order = sorted(
        bookings, key=lambda booking: (booking.day, booking.stall)
    )
    with open(path, "w", newline="") as bookings_file:
        writer = csv.writer(bookings_file)
        writer.writerow(BOOKING_COLUMNS)
        for booking in in_order:
            writer.writerow([booking.day, booking.stall, booking.trader])
