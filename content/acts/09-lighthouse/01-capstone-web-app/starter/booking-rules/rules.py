"""Agnes's booking rules: no Flask and no files, only the rules.

BookingError(message, status=400)
        raised for a booking the rules refuse. .message says why, in words a
        skipper would understand; .status is the HTTP status it deserves.
parse_date(text)
        a date written YYYY-MM-DD, as a datetime.date, or None if it isn't one.
check_booking(body, berths)
        body is what was sent: a dictionary, if anything. berths is a list of
        berths like the one in berths.py. Gives back a tidy booking, as a new
        dictionary, leaving body as it was:
            {"boat": "Kittiwake", "length": 9.5, "berth": 2,
             "date": "2027-04-10", "nights": 2}
        The boat's name has its spaces tidied and each word capitalised
        ("  mary   rose " is "Mary Rose"), the length is a float, and nights
        is 1 if it was left out.
        Raises BookingError, status 400, with a message, when:
            body isn't a dictionary
            the boat's name is missing, isn't text, or is only spaces
            the length isn't a number above 0
            no berth has that id, or the boat is longer than its max_length
            the date isn't a real date written YYYY-MM-DD
            nights isn't a whole number from 1 to 14
        True and False are not numbers here, though Python lets them pass
        for 1 and 0.
nights_of(booking)
        the set of dates a tidy booking stays, as datetime.date values. Two
        nights from the 10th are the 10th and the 11th; the boat leaves on
        the morning of the 12th.
check_clash(booking, others)
        raises BookingError, status 409, if any booking in others has the
        same berth on any of the same nights. The message names that boat,
        and the first night they share, written YYYY-MM-DD. Otherwise it
        does nothing.
"""
from datetime import datetime, timedelta

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


def check_booking(body, berths):
    """Agnes's rules, one at a time: a tidy booking, or a BookingError."""
    return body


def nights_of(booking):
    """The nights a tidy booking stays, as a set of dates."""
    return set()


def check_clash(booking, others):
    """A BookingError, status 409, if another boat has this berth on any of these nights."""


if __name__ == "__main__":
    from berths import BERTHS

    sent = {"boat": " kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2}
    kittiwake = check_booking(sent, BERTHS)
    print(kittiwake)
    print(sorted(nights_of(kittiwake)))

    for attempt in ({**sent, "length": 12.0}, {**sent, "boat": "Puffin", "date": "2027-04-11"}):
        try:
            check_clash(check_booking(attempt, BERTHS), [{**kittiwake, "id": 1}])
            print("Booked:", attempt["boat"])
        except BookingError as refused:
            print(refused.status, refused.message)
