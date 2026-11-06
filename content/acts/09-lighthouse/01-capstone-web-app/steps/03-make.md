---
id: booking-rules
type: make
title: The rules, before the routes
files: [rules.py, berths.py]
entry: rules.py
dialogue:
  - caitlin.thinking: "Before the web pages, the rules. The marina has kept them in people's heads for twenty years."
  - paul.pleased.point: "Then write them down where a test can reach them."
on_pass: { caitlin.pleased.thumbs: "Too long, too many nights, a berth that isn't there, and a clash. Every one refused, with a reason." }
hints:
  nudge: "What has to be true of each of the five fields before a booking is kept, and what should the refusal say when one isn't?"
  plan:
    - Refuse anything that isn't a dictionary
    - Check the boat's name is text with something in it
    - Check the length is a number above 0, and not True or False
    - Find the berth, then check the boat fits it
    - Check the date with parse_date
    - Check the nights, 1 if left out
    - Give back a new, tidy booking
    - For a clash, compare the sets of nights two bookings stay
  shape: |
    def check_booking(body, berths):
        if not isinstance(body, ___):
            raise BookingError("Send the booking as a JSON object.")
        boat = body.get("boat")
        ...
        nights = body.get("nights", ___)
        ...
        return {"boat": " ".join(boat.___()).title(), "length": ___(length), ...}


    def nights_of(booking):
        first = parse_date(booking["date"])
        return {first + timedelta(days=___) for n in range(booking["nights"])}


    def check_clash(booking, others):
        for other in others:
            shared = nights_of(other) ___ nights_of(booking)
            if other["berth"] == booking["berth"] and shared:
                raise BookingError(f"... {min(shared).isoformat()} ...", status=___)
---
A web app is a thin layer over plain functions, and those can be checked here. So the marina's rules come first, in `rules.py`, with no Flask and no files. `BookingError` and `parse_date` are written. Write the three functions from the docstring at the top:

1. `check_booking(body, berths)`: check each field, then give back a new, tidy booking. A refusal raises `BookingError` with a reason in words and the status 400.
2. `nights_of(booking)`: the set of nights a booking stays.
3. `check_clash(booking, others)`: raise `BookingError` with the status 409 if the berth is taken on any night they share. `&` gives what two sets share.

Mind Python's habit of treating `True` as 1: a boat of length `true` is not one metre long.

Done: every refusal in the brief raises with its status and a reason, and a good booking comes back tidied. Keep the file for the project.
