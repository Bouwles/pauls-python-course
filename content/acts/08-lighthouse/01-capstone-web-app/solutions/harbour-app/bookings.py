"""Bookings for the visitor berths, kept in one JSON file.

Only this module reads or writes the file. The routes call check_booking to
apply Agnes's rules, and a Bookings object to keep what passes.
"""
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

from berths import BERTHS

MAX_NIGHTS = 14


class BookingError(Exception):
    """A booking Agnes's rules refuse, with the HTTP status it deserves."""

    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


def parse_date(text):
    """A date written YYYY-MM-DD, or None if it isn't one."""
    if not isinstance(text, str):
        return None
    try:
        return datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError:
        return None


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def find_berth(berth_id):
    return next((berth for berth in BERTHS if berth["id"] == berth_id), None)


def check_booking(body):
    """Agnes's rules, one at a time. Gives back a tidy booking without an id."""
    if not isinstance(body, dict):
        raise BookingError("Send the booking as a JSON object.")
    boat = body.get("boat")
    if not isinstance(boat, str) or not boat.strip():
        raise BookingError("A booking needs a boat name.")
    length = body.get("length")
    if not is_number(length) or length <= 0:
        raise BookingError("The boat's length should be a number of metres, more than 0.")
    berth = find_berth(body.get("berth"))
    if berth is None:
        raise BookingError("There's no berth with that number. GET /api/berths lists them.")
    if length > berth["max_length"]:
        raise BookingError(f"{berth['name']} takes boats up to {berth['max_length']} m.")
    arrives = parse_date(body.get("date"))
    if arrives is None:
        raise BookingError("The date should be a real date, written YYYY-MM-DD.")
    nights = body.get("nights", 1)
    if not isinstance(nights, int) or isinstance(nights, bool) or not 1 <= nights <= MAX_NIGHTS:
        raise BookingError(f"Nights should be a whole number from 1 to {MAX_NIGHTS}.")
    return {"boat": " ".join(boat.split()).title(), "length": float(length), "berth": berth["id"],
            "date": arrives.isoformat(), "nights": nights}


def nights_of(booking):
    """The nights a booking covers: arrival night up to, not including, departure."""
    first = parse_date(booking["date"])
    return {first + timedelta(days=n) for n in range(booking["nights"])}


class Bookings:
    """Every booking, in a JSON file that survives a restart."""

    def __init__(self, path):
        self.path = Path(path)

    def _load(self):
        if not self.path.exists():
            return {"next_id": 1, "bookings": []}
        with open(self.path, encoding="utf-8") as data_file:
            return json.load(data_file)

    def _save(self, data):
        # Write a new file, then swap it in, so a crash can't leave half a file.
        spare = self.path.with_name(self.path.name + ".new")
        with open(spare, "w", encoding="utf-8") as data_file:
            json.dump(data, data_file, indent=2)
        os.replace(spare, self.path)

    def all(self, night=None):
        """Every booking, oldest first; or only those staying on one night."""
        bookings = self._load()["bookings"]
        if night is not None:
            bookings = [b for b in bookings if night in nights_of(b)]
        return bookings

    def get(self, booking_id):
        return next((b for b in self._load()["bookings"] if b["id"] == booking_id), None)

    def add(self, body):
        """Check a booking, refuse a clash, and keep it with the next number."""
        booking = check_booking(body)
        data = self._load()
        for other in data["bookings"]:
            if other["berth"] == booking["berth"] and nights_of(other) & nights_of(booking):
                raise BookingError(f"That berth is taken: {other['boat']} is in it then.", status=409)
        booking = {**booking, "id": data["next_id"]}
        data["bookings"].append(booking)
        data["next_id"] += 1
        self._save(data)
        return booking

    def cancel(self, booking_id):
        """Remove a booking. False if there was no such booking. Numbers aren't reused."""
        data = self._load()
        kept = [b for b in data["bookings"] if b["id"] != booking_id]
        if len(kept) == len(data["bookings"]):
            return False
        data["bookings"] = kept
        self._save(data)
        return True
