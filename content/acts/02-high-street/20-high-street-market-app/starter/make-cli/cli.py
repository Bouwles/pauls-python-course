"""Personal finance, from the command line. The only file that prints or exits.

python cli.py add DAY AMOUNT CATEGORY [--note NOTE]   money in or out, in pounds
python cli.py budget CATEGORY AMOUNT                  a monthly budget, in pounds
python cli.py report MONTH                            one month, like 2026-11
python cli.py balance                                 everything in, less everything out
    --file FILE        before the command: the money file (default money.json)

Adding prints one line, then saves:
    Paid in £1,450.00 on 2026-11-01.
    Spent £4.50 on food on 2026-11-03.
A budget prints one line, then saves:
    Budget for food: £120.00 a month.
The balance:
    Balance: £1,738.05
The report, with each category's spending in alphabetical order, its budget
if it has one, and how far over if it went over:
    November 2026
    Money in: £1,450.00
    Money out: £602.35
    food: £78.40 of £120.00
    fun: £53.95 of £40.00, over by £13.95
    home: £450.00 of £450.00
    travel: £20.00
    Left over: £847.65
A month with nothing in it:
    Nothing in December 2026.

Exit code 2, a usage error: an unknown command, a day that isn't a date, an
amount that isn't a number, a month that isn't one like 2026-11.
Exit code 1: a broken rule. The MoneyError's message goes on stderr, and
nothing is saved.
"""
import argparse
import sys
from datetime import date

from money import Ledger, MoneyError
from storage import load_ledger, save_ledger


def pence_from(text: str) -> int:
    """'-4.50' -> -450. Pounds typed in, whole pence out."""
    return round(float(text) * 100)


def money(pence: int) -> str:
    """-450 -> '-£4.50', 145000 -> '£1,450.00'."""
    sign = "-" if pence < 0 else ""
    return f"{sign}£{abs(pence) / 100:,.2f}"


# month_from(text): '2026-11' -> (2026, 11), or a ValueError
# Describe the tool, its commands and their arguments
# Read what was typed
# Load the ledger
# Do the command, and save if it changed anything
# Catch MoneyError: its message on stderr, exit with 1
# Run only when started as a program
