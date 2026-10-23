"""Reading and writing the market's files. The rules live in stalls.py.

load_stalls(path)              a list of Stalls from a CSV file with the
                               columns number,size,price. A missing file
                               raises FileNotFoundError: cli.py deals with it.
load_bookings(path)            a list of Bookings from a CSV file with the
                               columns day,stall,trader. A missing file just
                               means no bookings yet: give back [].
save_bookings(path, bookings)  writes the file: a header row, then one row
                               per booking, sorted by day and then stall.
                               It doesn't reorder the list it was given.
"""
import csv
from datetime import date

from stalls import Booking, Stall
