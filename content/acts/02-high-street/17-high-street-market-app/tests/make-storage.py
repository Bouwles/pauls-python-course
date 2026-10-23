from datetime import date as _date

SAT = _date(2026, 11, 7)
NEXT_SAT = _date(2026, 11, 14)
PITCHES = "number,size,price\n7,large,30\n2,small,10\n"


def kit(ctx, files=None):
    """The learner's storage module and their stalls module."""
    store = ctx.module(files=files)
    for name in ("load_stalls", "load_bookings", "save_bookings"):
        if not callable(getattr(store, name, None)):
            raise CheckFailed(f"storage.py needs a function called {name}.")
    import stalls
    return store, stalls


def same(got, want, message):
    if got != want:
        raise CheckFailed(message, expected=repr(want), actual=repr(got))


def lines_of(path):
    with open(path, newline="") as saved:
        return saved.read().splitlines()


def loading_stalls(ctx):
    store, stalls = kit(ctx)
    loaded = store.load_stalls("stalls.csv")
    same(len(loaded), 13, "stalls.csv has 13 stalls.")
    same(loaded[0], stalls.Stall(1, "small", 12), "The first stall in stalls.csv.")
    same(loaded[-1], stalls.Stall(14, "large", 25), "The last stall in stalls.csv.")


def save_then_load(ctx):
    store, stalls = kit(ctx)
    bookings = [stalls.Booking(SAT, 3, "Bea"), stalls.Booking(SAT, 1, "Sanjay")]
    store.save_bookings("saved.csv", bookings)
    same(store.load_bookings("saved.csv"), [stalls.Booking(SAT, 1, "Sanjay"), stalls.Booking(SAT, 3, "Bea")],
         "Loading what was saved gives the same bookings, sorted by stall.")


def numbers_are_numbers(ctx):
    store, stalls = kit(ctx)
    first = store.load_stalls("stalls.csv")[0]
    if not isinstance(first.number, int) or not isinstance(first.price, int):
        raise CheckFailed("A stall's number and price should be whole numbers, not text.", expected="Stall(number=1, size='small', price=12)", actual=repr(first))


def days_are_dates(ctx):
    store, stalls = kit(ctx)
    first = store.load_bookings("bookings.csv")[0]
    if not isinstance(first.day, _date) or not isinstance(first.stall, int):
        raise CheckFailed("A booking's day should be a date and its stall a whole number.", expected=repr(stalls.Booking(SAT, 1, "Sanjay")), actual=repr(first))
    same(first, stalls.Booking(SAT, 1, "Sanjay"), "The first booking in bookings.csv.")


def no_bookings_file(ctx):
    store, stalls = kit(ctx)
    same(store.load_bookings("nothing-yet.csv"), [], "A bookings file that isn't there yet means no bookings.")


def no_stalls_file(ctx):
    store, stalls = kit(ctx)
    try:
        got = store.load_stalls("nothing-here.csv")
    except FileNotFoundError:
        return
    raise CheckFailed("A missing stalls file should raise FileNotFoundError, so cli.py can say which file is missing.", expected="FileNotFoundError", actual=repr(got))


def header_and_order(ctx):
    store, stalls = kit(ctx)
    store.save_bookings("saved.csv", [
        stalls.Booking(NEXT_SAT, 1, "Sanjay"),
        stalls.Booking(SAT, 14, "Okonjo"),
        stalls.Booking(SAT, 2, "Bea"),
        stalls.Booking(SAT, 1, "Sanjay"),
    ])
    want = ["day,stall,trader", "2026-11-07,1,Sanjay", "2026-11-07,2,Bea", "2026-11-07,14,Okonjo", "2026-11-14,1,Sanjay"]
    same(lines_of("saved.csv"), want, "A header row, then the bookings sorted by day and then stall number.")


def comma_in_name(ctx):
    store, stalls = kit(ctx)
    bookings = [stalls.Booking(SAT, 5, "Hollis, Bea")]
    store.save_bookings("saved.csv", bookings)
    same(store.load_bookings("saved.csv"), bookings, "A trader's name with a comma in it should come back in one piece.")


def leaves_list_alone(ctx):
    store, stalls = kit(ctx)
    bookings = [stalls.Booking(SAT, 3, "Bea"), stalls.Booking(SAT, 1, "Sanjay")]
    before = list(bookings)
    store.save_bookings("saved.csv", bookings)
    same(bookings, before, "save_bookings changed the order of the list it was given.")


def other_stalls_file(ctx):
    store, stalls = kit(ctx, files={"pitches.csv": PITCHES})
    same(store.load_stalls("pitches.csv"), [stalls.Stall(7, "large", 30), stalls.Stall(2, "small", 10)],
         "load_stalls should read whichever file it's given, in the file's order.")


def empty_save(ctx):
    store, stalls = kit(ctx)
    store.save_bookings("saved.csv", [])
    same(lines_of("saved.csv"), ["day,stall,trader"], "With no bookings, the file is just the header.")
    same(store.load_bookings("saved.csv"), [], "A file with only a header has no bookings.")


TESTS = [
    custom("Loading the stalls", loading_stalls, visible=True),
    custom("Save, then load", save_then_load, visible=True),
    custom("Numbers come back as numbers", numbers_are_numbers,
           hint="csv gives every value as text. int() the number and the price."),
    custom("Days come back as dates", days_are_dates,
           hint="date.fromisoformat(\"2026-11-07\") turns the text back into a date."),
    custom("No bookings file yet", no_bookings_file,
           hint="Catch FileNotFoundError in load_bookings and give back an empty list."),
    custom("No stalls file is an error", no_stalls_file,
           hint="Don't catch FileNotFoundError in load_stalls. Without stalls there's no market, and cli.py will explain."),
    custom("A header, then day and stall order", header_and_order,
           hint="Sort by (day, stall) with the stall as a number, so 2 comes before 14. Write the header row first."),
    custom("A trader with a comma in their name", comma_in_name,
           hint="Use csv.writer and csv.DictReader rather than joining with commas yourself: they quote a name with a comma in it."),
    custom("Saving leaves your list alone", leaves_list_alone,
           hint="sorted() makes a new list. .sort() reorders the one you were given."),
    custom("Another stalls file", other_stalls_file,
           hint="Open the path you were given, not stalls.csv every time."),
    custom("No bookings at all", empty_save,
           hint="An empty list should still write the header row, and load back as []."),
]
