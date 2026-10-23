"""The market's rules. No files and no printing in here.

The requirements, as the traders' association agreed them:

Stall(number, size, price)      a dataclass: size is "small" or "large",
                                price is whole pounds
Booking(day, stall, trader)     a dataclass: day is a datetime.date,
                                stall is a stall number
BookingError                    an Exception for any broken rule

Market(stalls, bookings=None)   all the stalls, and any bookings so far.
                                It keeps its own list of bookings: booking
                                never changes the list you passed in.
  .bookings                     that list: every booking, every day
  .book(day, number, trader)    adds a Booking and returns it, or raises
                                BookingError with one of these messages:
      not a Saturday              The market is only on Saturdays.
      no such stall               There is no stall 13.
      stall taken that day        Stall 3 is already booked on 2026-11-07.
      trader has 2 that day       Bea already has 2 stalls on 2026-11-07.
  .cancel(day, number, trader)  removes that trader's booking, or raises:
                                Gwen has no booking for stall 2 on 2026-11-07.
  .free_stalls(day)             a list of the Stalls free that day, by number
  .bookings_on(day)             a list of that day's Bookings, by stall number
  .takings(day)                 what that day's booked stalls pay, in pounds
"""
# From Penhallow's old market ledger, copied in by Moss:
# There is no stall 13. The traders asked, and I don't argue with people
# who own that many knives. The machine on the hill numbered it anyway.
# It doesn't know about luck yet. A.P.

from dataclasses import dataclass
from datetime import date
