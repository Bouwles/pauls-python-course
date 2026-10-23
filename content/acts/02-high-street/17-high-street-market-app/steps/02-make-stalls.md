---
id: make-stalls
type: make
title: The rules
files: [stalls.py]
entry: stalls.py
on_pass: { sanjay: "No double bookings, no Thursdays, nobody hogging the corner. That's the exercise book retired." }
hints:
  nudge: "Which method needs to know about every other booking that day? Could `book` lean on `bookings_on`?"
  plan:
    - Write BookingError, then Stall and Booking as dataclasses
    - In __init__, keep the stalls and your own list of bookings
    - Write bookings_on, then build free_stalls and takings on top of it
    - In book, check the rules in order and raise BookingError at the first one broken
    - In cancel, find that exact booking or refuse
  shape: |
    class Market:
        def __init__(self, stalls, bookings=None):
            self.stalls = {stall.number: stall for stall in stalls}
            self.bookings = ___

        def bookings_on(self, day):
            todays = [booking for booking in self.bookings if ___]
            return sorted(todays, key=___)

        def book(self, day, number, trader):
            if day.weekday() != ___:
                raise BookingError("The market is only on Saturdays.")
            ...
            booking = Booking(day, number, trader)
            self.bookings.___(booking)
            return booking
---
The rules first. The requirements are at the top of `stalls.py`, exactly as the checks read them: names, arguments, and the message for every refusal.

The visible checks book a stall and add up a day. The hidden ones try every rule both ways, including the ones people forget: the same stall next Saturday is fine, and two `Market`s must never share a list of bookings.

Try it as you go with a few lines under `if __name__ == "__main__":`. They won't run during the checks.
