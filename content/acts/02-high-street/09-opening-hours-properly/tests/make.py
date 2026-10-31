import importlib
from datetime import datetime

BOARD = """Saturday 11:30 at the Clocktower
The Studio: open
The Makerspace: closed
The Workshop: open

The Studio's door:
  Mon 8 till 18
  Tue 8 till 18
  Wed 8 till 18
  Thu 8 till 18
  Fri 8 till 18
  Sat 8 till 13
  Sun closed

Busiest in the Studio: Sat"""

SHOP = {"Mon": (9, 17), "Sat": (10, 13)}


def load_hours(ctx):
    # Import hours.py on its own, without running the board in main.py.
    ctx.module(files={"main.py": "import hours\n"})
    return importlib.import_module("hours")


def is_open_case(when, expected, what):
    def check(ctx):
        hours = load_hours(ctx)
        got = hours.is_open(SHOP, when)
        if got is not expected:
            raise CheckFailed(f"is_open for a room open Mon 9 till 17, on {what}, should be {expected}.",
                              expected=repr(expected), actual=repr(got))
    return check


def sign_case(ctx):
    hours = load_hours(ctx)
    expected = ["Mon closed", "Tue 10 till 16", "Wed closed", "Thu closed", "Fri closed", "Sat 9 till 12", "Sun closed"]
    got = hours.sign({"Tue": (10, 16), "Sat": (9, 12)})
    if got != expected:
        raise CheckFailed("sign should give back seven lines, Monday first.", expected=repr(expected), actual=repr(got))


def busiest_case(visits, expected, message):
    def check(ctx):
        hours = load_hours(ctx)
        got = hours.busiest_day(visits)
        if got != expected:
            raise CheckFailed(message, expected=repr(expected), actual=repr(got))
    return check


def runs_on_its_own(ctx):
    old_entry = ctx.entry
    ctx.entry = "hours.py"
    try:
        result = ctx.run_program()
    finally:
        ctx.entry = old_entry
    if result.error is not None:
        raise CheckFailed(f"Run on its own, hours.py crashed: {type(result.error).__name__}: {result.error}")
    if not result.output.strip():
        raise CheckFailed("Run on its own, hours.py should print a quick check of its own functions. It printed nothing.")


TESTS = [
    output("The Clocktower board", expect=BOARD, visible=True,
           hint="If there are extra lines at the top, hours.py is printing when it's imported. Put its checks under the main guard."),
    custom("Open at 9:00 on a Monday", is_open_case(datetime(2026, 3, 16, 9, 0), True, "Monday at 9:00"), visible=True),
    custom("Closed at the closing hour", is_open_case(datetime(2026, 3, 16, 17, 0), False, "Monday at 17:00"),
           hint="At 17:00 a room that closes at 17 is closed. Open means opens <= hour < closes."),
    custom("Open just before closing", is_open_case(datetime(2026, 3, 16, 16, 59), True, "Monday at 16:59")),
    custom("Closed before opening", is_open_case(datetime(2026, 3, 16, 8, 59), False, "Monday at 8:59")),
    custom("Closed on a day with no hours", is_open_case(datetime(2026, 3, 15, 12, 0), False, "Sunday at noon"),
           hint="A day missing from the dictionary is a closed day. hours.get(day) gives None for it."),
    custom("A sign for another room", sign_case,
           hint="Every day gets a line, in DAYS order. Days with no hours say closed."),
    custom("Busiest day of another week",
           busiest_case([datetime(2026, 3, 17, 9, 0), datetime(2026, 3, 18, 9, 0), datetime(2026, 3, 24, 9, 0)], "Tue",
                        "Two Tuesdays and a Wednesday: the busiest day is Tue."),
           hint="Turn each visit into its day name first, then count the names."),
    custom("A tie goes to the day seen first",
           busiest_case([datetime(2026, 3, 20, 9, 0), datetime(2026, 3, 16, 9, 0), datetime(2026, 3, 27, 9, 0), datetime(2026, 3, 23, 9, 0)], "Fri",
                        "Fri and Mon both come up twice. Fri was seen first, so it wins."),
           hint="Counter's most_common keeps tied days in the order they first appeared."),
    custom("No visits at all", busiest_case([], None, "With no visits, busiest_day should give back None."),
           hint="With no visits there's no busiest day. Return None before counting anything."),
    custom("hours.py runs on its own", runs_on_its_own,
           hint="Under if __name__ == \"__main__\": at the bottom of hours.py, print a quick check or two."),
]
