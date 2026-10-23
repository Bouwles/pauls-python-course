import dataclasses as _dataclasses
from datetime import date as _date

SAT = _date(2026, 11, 7)
NEXT_SAT = _date(2026, 11, 14)
TUESDAY = _date(2026, 11, 10)


def kit(ctx):
    """The learner's module and four stalls made from their Stall class."""
    mod = ctx.module()
    for name in ("Stall", "Booking", "Market", "BookingError"):
        if not hasattr(mod, name):
            raise CheckFailed(f"stalls.py needs {name}. Everything is listed at the top of the file.")
    stalls = [mod.Stall(1, "small", 12), mod.Stall(2, "small", 12),
              mod.Stall(3, "large", 20), mod.Stall(14, "large", 25)]
    return mod, stalls


def refused(mod, action, message, why):
    try:
        action()
    except mod.BookingError as error:
        if str(error) != message:
            raise CheckFailed("Refused, but with a different message. The command line will print it, so it has to match.", expected=message, actual=str(error))
        return
    raise CheckFailed(why, expected=f"BookingError: {message}", actual="no BookingError")


def same(got, want, message):
    if got != want:
        raise CheckFailed(message, expected=repr(want), actual=repr(got))


def book_free_stall(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    made = market.book(SAT, 3, "Bea")
    same(made, mod.Booking(SAT, 3, "Bea"), "book should return the new Booking.")
    same(market.bookings_on(SAT), [mod.Booking(SAT, 3, "Bea")], "After booking, bookings_on(day) should list it.")


def takings_for_day(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 1, "Sanjay")
    market.book(SAT, 3, "Bea")
    market.book(SAT, 14, "Okonjo")
    same(market.takings(SAT), 57, "Stalls 1, 3 and 14 pay 12, 20 and 25.")


def no_double_booking(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 3, "Bea")
    refused(mod, lambda: market.book(SAT, 3, "Gwen"), "Stall 3 is already booked on 2026-11-07.",
            "Gwen booked stall 3 on a day Bea already had it.")


def same_stall_next_week(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 3, "Bea")
    market.book(NEXT_SAT, 3, "Gwen")
    same(market.bookings_on(NEXT_SAT), [mod.Booking(NEXT_SAT, 3, "Gwen")], "Stall 3 next Saturday is Gwen's.")


def two_each(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 1, "Bea")
    market.book(SAT, 2, "Bea")
    refused(mod, lambda: market.book(SAT, 3, "Bea"), "Bea already has 2 stalls on 2026-11-07.",
            "Bea got a third stall on one day.")


def limit_is_per_trader(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 1, "Bea")
    market.book(SAT, 2, "Bea")
    market.book(SAT, 3, "Gwen")
    market.book(NEXT_SAT, 14, "Bea")
    same(len(market.bookings), 4, "Gwen's stall and Bea's stall next week are both allowed.")


def saturdays_only(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    refused(mod, lambda: market.book(TUESDAY, 1, "Bea"), "The market is only on Saturdays.",
            "A booking on a Tuesday went through.")


def no_such_stall(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    refused(mod, lambda: market.book(SAT, 13, "Bea"), "There is no stall 13.",
            "Stall 13 doesn't exist, but it was booked.")


def cancel_frees(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 3, "Bea")
    market.cancel(SAT, 3, "Bea")
    same(market.bookings_on(SAT), [], "After cancelling, the day has no bookings.")
    same(market.takings(SAT), 0, "After cancelling, the day takes nothing.")
    market.book(SAT, 3, "Gwen")


def cancel_nothing(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    refused(mod, lambda: market.cancel(SAT, 2, "Gwen"), "Gwen has no booking for stall 2 on 2026-11-07.",
            "Cancelling a booking that doesn't exist should be refused.")


def cancel_someone_elses(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 1, "Sanjay")
    refused(mod, lambda: market.cancel(SAT, 1, "Gwen"), "Gwen has no booking for stall 1 on 2026-11-07.",
            "Gwen cancelled Sanjay's booking.")
    same(market.bookings_on(SAT), [mod.Booking(SAT, 1, "Sanjay")], "Sanjay should still have stall 1.")


def free_in_order(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(list(reversed(stalls)))
    market.book(SAT, 2, "Gwen")
    want = [mod.Stall(1, "small", 12), mod.Stall(3, "large", 20), mod.Stall(14, "large", 25)]
    same(market.free_stalls(SAT), want, "free_stalls should list the free Stalls by number, even if they arrived in another order.")


def day_in_order(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 14, "Okonjo")
    market.book(NEXT_SAT, 3, "Bea")
    market.book(SAT, 1, "Sanjay")
    want = [mod.Booking(SAT, 1, "Sanjay"), mod.Booking(SAT, 14, "Okonjo")]
    same(market.bookings_on(SAT), want, "bookings_on should list only that day's bookings, by stall number.")


def empty_day(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    same(market.takings(SAT), 0, "A day with no bookings takes nothing.")
    same(market.bookings_on(SAT), [], "A day with no bookings has none to list.")
    same(len(market.free_stalls(SAT)), 4, "On an empty day, every stall is free.")


def saved_bookings_count(ctx):
    mod, stalls = kit(ctx)
    saved = [mod.Booking(SAT, 1, "Sanjay"), mod.Booking(SAT, 2, "Sanjay")]
    market = mod.Market(stalls, saved)
    same(market.takings(SAT), 24, "Bookings passed in at the start count towards the takings.")
    refused(mod, lambda: market.book(SAT, 1, "Gwen"), "Stall 1 is already booked on 2026-11-07.",
            "Stall 1 was already booked when the market started.")
    refused(mod, lambda: market.book(SAT, 3, "Sanjay"), "Sanjay already has 2 stalls on 2026-11-07.",
            "Sanjay already had two stalls when the market started.")


def markets_dont_share(ctx):
    mod, stalls = kit(ctx)
    first = mod.Market(stalls)
    first.book(SAT, 1, "Sanjay")
    second = mod.Market(stalls)
    same(second.bookings_on(SAT), [], "A brand new market should have no bookings.")


def keeps_own_copy(ctx):
    mod, stalls = kit(ctx)
    saved = [mod.Booking(SAT, 1, "Sanjay")]
    market = mod.Market(stalls, saved)
    market.book(SAT, 2, "Gwen")
    same(len(saved), 1, "Booking changed the list that was passed in to Market.")


def every_booking(ctx):
    mod, stalls = kit(ctx)
    market = mod.Market(stalls)
    market.book(SAT, 1, "Sanjay")
    market.book(NEXT_SAT, 3, "Bea")
    same(sorted(market.bookings, key=lambda booking: booking.day),
         [mod.Booking(SAT, 1, "Sanjay"), mod.Booking(NEXT_SAT, 3, "Bea")],
         "market.bookings should hold every booking, every day.")


def are_dataclasses(ctx):
    mod = ctx.module()
    for name in ("Stall", "Booking"):
        if not _dataclasses.is_dataclass(getattr(mod, name, None)):
            raise CheckFailed(f"{name} should be a dataclass.")


TESTS = [
    custom("Booking a free stall", book_free_stall, visible=True),
    custom("Takings for the day", takings_for_day, visible=True),
    custom("Stall and Booking are dataclasses", are_dataclasses,
           hint="@dataclass above each class, with the fields in the order the requirements give."),
    custom("One trader per stall per day", no_double_booking,
           hint="Before booking, look through that day's bookings for the same stall number."),
    custom("The same stall, a week later", same_stall_next_week,
           hint="A stall booked this Saturday is free next Saturday. Compare the day as well as the stall."),
    custom("Two stalls each, no more", two_each,
           hint="Count the trader's bookings that day before adding one. Two is the most, so a third is refused."),
    custom("Bea's limit is hers alone", limit_is_per_trader,
           hint="Count only this trader's bookings, and only on this day."),
    custom("Saturdays only", saturdays_only,
           hint="day.weekday() is 5 on a Saturday."),
    custom("There is no stall 13", no_such_stall,
           hint="Check the stall number is one of the market's stalls."),
    custom("Cancelling frees the stall", cancel_frees,
           hint="cancel should remove the booking, so the stall is free again and the takings drop."),
    custom("Cancelling what isn't there", cancel_nothing,
           hint="If there's no booking for that day, stall and trader, raise BookingError."),
    custom("Only the trader who booked can cancel", cancel_someone_elses,
           hint="Match the trader as well as the day and the stall."),
    custom("Free stalls, in stall order", free_in_order,
           hint="Sort the free stalls by number before giving them back."),
    custom("A day's bookings, in stall order", day_in_order,
           hint="Keep only that day's bookings, then sort them with key=lambda booking: booking.stall."),
    custom("An empty day", empty_day,
           hint="No bookings: takings 0, an empty list, every stall free."),
    custom("Starting from saved bookings", saved_bookings_count,
           hint="Bookings passed to Market() count for every rule, the same as ones made with book."),
    custom("Two markets don't share bookings", markets_dont_share,
           hint="A default of [] in __init__ is made once and shared by every Market. Default to None, and make a new list inside."),
    custom("The market keeps its own copy", keeps_own_copy,
           hint="list(bookings) gives the market its own copy, so the caller's list is left alone."),
    custom("market.bookings has every booking", every_booking,
           hint="Keep every booking, from every day, in one list called bookings."),
]
