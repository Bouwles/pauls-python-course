"""The market's command line. The only file that prints or exits.

python cli.py DAY                                the day sheet
python cli.py DAY --book STALL --trader NAME     book a stall
python cli.py DAY --cancel STALL --trader NAME   cancel a booking
    --stalls FILE      the stalls file (default stalls.csv)
    --bookings FILE    the bookings file (default bookings.csv)

The day sheet:
    Market on 2026-11-07
    Stall 1 (small, £12): Sanjay
    Stall 2 (small, £12): free
    ...
    Takings: £57

A booking or a cancellation prints one line, then saves every booking:
    Booked stall 2 for Gwen on 2026-11-07.
    Cancelled stall 1 for Sanjay on 2026-11-07.

Exit code 2, a usage error: a day that isn't a date, a stall that isn't a
number, --book or --cancel without --trader, or both at once.
Exit code 1: a broken rule (the BookingError's message, on stderr, nothing
saved) or a missing stalls file ("Can't find stalls.csv." on stderr).
"""
import argparse
import sys
from datetime import date

from stalls import BookingError, Market
from storage import load_bookings, load_stalls, save_bookings

# Describe the tool and its arguments
# Read what was typed, and check --trader came with --book or --cancel
# Load the stalls and the bookings, or say which file is missing
# Book or cancel and save, or print the day sheet
# Catch BookingError: its message on stderr, exit with 1
# Run only when started as a program
