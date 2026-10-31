"""Bookings for the visitor berths, kept in one JSON file.

Only this module reads or writes the file. The marina's rules are in rules.py;
a Bookings object applies them, then keeps whatever passes.
"""
import json
import os
from pathlib import Path

from berths import BERTHS
from rules import check_booking, check_clash, nights_of


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
        """Check a booking against the rules and the other bookings, then keep it with the next number."""
        booking = check_booking(body, BERTHS)
        data = self._load()
        check_clash(booking, data["bookings"])
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
