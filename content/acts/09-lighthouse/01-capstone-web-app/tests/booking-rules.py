from datetime import date

BERTHS = [
    {"id": 1, "name": "Pontoon A", "max_length": 8.0},
    {"id": 2, "name": "Pontoon B", "max_length": 10.0},
    {"id": 3, "name": "Pontoon C", "max_length": 10.0},
    {"id": 4, "name": "North Quay", "max_length": 15.0},
    {"id": 5, "name": "Harbour Wall", "max_length": 24.0},
]
# Another harbour's berths, so nothing can lean on the ids in berths.py.
OTHER_HARBOUR = [
    {"id": 7, "name": "East Pontoon", "max_length": 12.0},
    {"id": 8, "name": "Slipway", "max_length": 6.5},
]
KITTIWAKE = {"boat": " kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2}


def rules(ctx):
    module = ctx.module()
    for name in ("BookingError", "check_booking", "nights_of", "check_clash"):
        if not hasattr(module, name):
            raise CheckFailed(f"There is no {name} in rules.py.")
    return module


def same(what, got, want):
    if got != want:
        raise CheckFailed(what, expected=want, actual=got)


def refused(module, call, status, what):
    """Run call(); it should raise the module's BookingError with this status and a message."""
    try:
        result = call()
    except module.BookingError as problem:
        if problem.status != status:
            raise CheckFailed(f"{what}: refused, but with the wrong status.", expected=status, actual=problem.status)
        if not isinstance(problem.message, str) or not problem.message.strip():
            raise CheckFailed(f"{what}: refused, but with no message saying why.", actual=problem.message)
        return problem.message
    except Exception as problem:
        raise CheckFailed(f"{what}: it should raise BookingError, not {type(problem).__name__}.", actual=f"{type(problem).__name__}: {problem}")
    raise CheckFailed(f"{what}: it should be refused with a BookingError, status {status}.", actual=result)


def accepted(module, body, berths, what):
    try:
        return module.check_booking(body, berths)
    except module.BookingError as problem:
        raise CheckFailed(f"{what}: it should be accepted.", actual=f"BookingError: {problem.message}")


def the_kittiwake(ctx):
    module = rules(ctx)
    same("check_booking for the Kittiwake", module.check_booking(dict(KITTIWAKE), BERTHS),
         {"boat": "Kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2})


def too_long_for_pontoon_b(ctx):
    module = rules(ctx)
    refused(module, lambda: module.check_booking({**KITTIWAKE, "length": 12.0}, BERTHS), 400, "A 12 m boat for Pontoon B")


def another_harbour(ctx):
    module = rules(ctx)
    booking = accepted(module, {"boat": "mary   rose", "length": 6, "berth": 8, "date": "2028-01-31"}, OTHER_HARBOUR, "The Mary Rose at the Slipway")
    same("The Mary Rose, 6 m, one night at the Slipway (berth 8)", booking,
         {"boat": "Mary Rose", "length": 6.0, "berth": 8, "date": "2028-01-31", "nights": 1})
    if not isinstance(booking["length"], float):
        raise CheckFailed("The length should be a float, even when it was sent as a whole number.", actual=type(booking["length"]).__name__)


def body_left_alone(ctx):
    module = rules(ctx)
    sent = {"boat": "  shearwater ", "length": 11.5, "berth": 7, "date": "2027-08-01", "nights": 3}
    kept = dict(sent)
    module.check_booking(sent, OTHER_HARBOUR)
    same("What was sent, after check_booking has looked at it", sent, kept)


def bad_bodies_and_names(ctx):
    module = rules(ctx)
    for body in (None, [], "Kittiwake"):
        refused(module, lambda: module.check_booking(body, BERTHS), 400, f"A booking sent as {body!r}")
    no_name = {key: value for key, value in KITTIWAKE.items() if key != "boat"}
    refused(module, lambda: module.check_booking(no_name, BERTHS), 400, "A booking with no boat")
    for boat in ("   ", 42, None):
        refused(module, lambda: module.check_booking({**KITTIWAKE, "boat": boat}, BERTHS), 400, f"A boat called {boat!r}")


def lengths(ctx):
    module = rules(ctx)
    for length in (0, -3, "nine", None, True):
        refused(module, lambda: module.check_booking({**KITTIWAKE, "length": length}, BERTHS), 400, f"A length of {length!r}")


def berths_and_fit(ctx):
    module = rules(ctx)
    for berth in (9, "2", None):
        refused(module, lambda: module.check_booking({**KITTIWAKE, "berth": berth}, BERTHS), 400, f"Berth {berth!r}")
    slipway = {"boat": "Puffin", "length": 6.6, "berth": 8, "date": "2027-05-01"}
    refused(module, lambda: module.check_booking(slipway, OTHER_HARBOUR), 400, "A 6.6 m boat at the 6.5 m Slipway")
    accepted(module, {**slipway, "length": 6.5}, OTHER_HARBOUR, "A 6.5 m boat at the 6.5 m Slipway")


def dates(ctx):
    module = rules(ctx)
    for when in ("2027-02-30", "10/04/2027", "soon", None, 20270410):
        refused(module, lambda: module.check_booking({**KITTIWAKE, "date": when}, BERTHS), 400, f"A date of {when!r}")


def nights(ctx):
    module = rules(ctx)
    for count in (0, 15, 2.5, "two", True):
        refused(module, lambda: module.check_booking({**KITTIWAKE, "nights": count}, BERTHS), 400, f"Nights of {count!r}")
    same("Fourteen nights", accepted(module, {**KITTIWAKE, "nights": 14}, BERTHS, "Fourteen nights")["nights"], 14)


def the_nights_a_boat_stays(ctx):
    module = rules(ctx)
    same("nights_of a two-night booking from 10 April 2027",
         module.nights_of({"boat": "Kittiwake", "length": 9.5, "berth": 2, "date": "2027-04-10", "nights": 2}),
         {date(2027, 4, 10), date(2027, 4, 11)})
    same("nights_of three nights from 28 February 2028, a leap year",
         module.nights_of({"boat": "Puffin", "length": 7.0, "berth": 1, "date": "2028-02-28", "nights": 3}),
         {date(2028, 2, 28), date(2028, 2, 29), date(2028, 3, 1)})


def booked(boat, berth, when, count, number):
    return {"boat": boat, "length": 7.0, "berth": berth, "date": when, "nights": count, "id": number}


def a_clash(ctx):
    module = rules(ctx)
    gannet = booked("Gannet", 7, "2027-06-10", 5, 1)
    tern = {"boat": "Tern", "length": 6.0, "berth": 7, "date": "2027-06-12", "nights": 4}
    message = refused(module, lambda: module.check_clash(tern, [gannet]), 409, "The Tern into the Gannet's berth for three of its nights")
    if "Gannet" not in message:
        raise CheckFailed("The refusal should name the boat already in the berth.", expected="Gannet", actual=message)
    if "2027-06-12" not in message:
        raise CheckFailed("The refusal should name the first night they share, written YYYY-MM-DD.", expected="2027-06-12", actual=message)


def no_clash(ctx):
    module = rules(ctx)
    gannet = booked("Gannet", 7, "2027-06-10", 2, 1)
    for boat, berth, when, count in (("Tern", 7, "2027-06-12", 1), ("Skua", 7, "2027-06-08", 2), ("Eider", 8, "2027-06-10", 2)):
        newcomer = {"boat": boat, "length": 6.0, "berth": berth, "date": when, "nights": count}
        try:
            module.check_clash(newcomer, [gannet])
        except Exception as problem:
            stay = f"{count} night{'s' if count != 1 else ''} from {when} at berth {berth}"
            raise CheckFailed(f"The {boat}, {stay}, shares no night with the Gannet (berth 7, the nights of 2027-06-10 and 2027-06-11).",
                              actual=f"{type(problem).__name__}: {problem}")
    module.check_clash(gannet, [])


def clash_further_down(ctx):
    module = rules(ctx)
    others = [booked("Gannet", 8, "2027-06-10", 2, 1), booked("Eider", 7, "2027-06-14", 3, 2)]
    newcomer = {"boat": "Tern", "length": 6.0, "berth": 7, "date": "2027-06-11", "nights": 5}
    message = refused(module, lambda: module.check_clash(newcomer, others), 409, "The Tern, five nights, into a berth the Eider takes on the 14th")
    if "Eider" not in message or "2027-06-14" not in message:
        raise CheckFailed("The refusal should name the Eider and the night of 2027-06-14.", actual=message)


TESTS = [
    custom("The Kittiwake, tidied", the_kittiwake, visible=True),
    custom("A 12 m boat for Pontoon B is refused with 400", too_long_for_pontoon_b, visible=True),
    custom("Another harbour's berths, and one night if nights is left out", another_harbour,
           hint="Use the berths you're given, not the ones in berths.py, and turn the length into a float."),
    custom("What was sent is left as it was", body_left_alone, hint="Build a new dictionary for the tidy booking instead of changing body."),
    custom("No booking, or no boat name", bad_bodies_and_names,
           hint="Check that body is a dict before calling .get on it, and that the name is text with something in it besides spaces."),
    custom("Lengths that aren't a number above 0", lengths,
           hint="True is an int in Python. Check isinstance(length, bool) before you believe it's a number."),
    custom("Unknown berths, and boats too long for theirs", berths_and_fit,
           hint="A boat exactly as long as max_length fits. The berth id \"2\" is text, and no berth has that id."),
    custom("Dates that aren't real", dates, hint="parse_date gives None for anything that isn't a real YYYY-MM-DD date. Use it."),
    custom("Nights from 1 to 14, whole numbers only", nights,
           hint="2.5 isn't a whole number, and True isn't a number of nights."),
    custom("The nights a boat stays", the_nights_a_boat_stays,
           hint="Start from the arrival date and add timedelta(days=n) for each night; the boat leaves on the morning after the last."),
    custom("A clash is refused with 409, naming the boat and the night", a_clash,
           hint="Find the nights both bookings share, then name the earliest of them."),
    custom("Back to back, another berth, or nobody else: no clash", no_clash,
           hint="A boat arriving on the morning another leaves doesn't share a night with it."),
    custom("The clash can be with any booking, not just the first", clash_further_down),
]
