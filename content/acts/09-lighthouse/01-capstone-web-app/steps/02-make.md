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
A web app is mostly a thin layer over plain functions, and plain functions can be checked here, where Flask can't run. So the rules come first.

`rules.py` holds the marina's rules and nothing else: no Flask, no files. `BookingError` and `parse_date` are written; write `check_booking`, `nights_of` and `check_clash` from the docstring at the top.

A refusal is an exception, `BookingError`, carrying a message in words and the status it deserves: 400 for anything wrong with what was sent, 409 for a clash. The routes will catch it and answer with JSON; the form will catch it and answer with a sentence.

Mind Python's habit of treating `True` as 1. JSON's `true` arrives as `True`, and a boat of length `True` is not one metre long.

Keep this file. In the next step it goes home with you, into the project.
