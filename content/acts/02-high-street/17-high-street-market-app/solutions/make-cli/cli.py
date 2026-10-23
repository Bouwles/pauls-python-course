"""The market's command line. The only file that prints or exits."""
import argparse
import sys
from datetime import date

from stalls import BookingError, Market, Stall
from storage import load_bookings, load_stalls, save_bookings


def read_arguments() -> argparse.Namespace:
    """What was typed, checked. Usage errors exit with code 2."""
    parser = argparse.ArgumentParser(
        description="Book stalls at the High Street's Saturday market."
    )
    parser.add_argument("day", type=date.fromisoformat,
                        help="the market day, like 2026-11-07")
    parser.add_argument("--book", type=int, metavar="STALL",
                        help="book this stall")
    parser.add_argument("--cancel", type=int, metavar="STALL",
                        help="cancel the booking for this stall")
    parser.add_argument("--trader", help="who the booking is for")
    parser.add_argument("--stalls", default="stalls.csv",
                        help="the stalls file (default stalls.csv)")
    parser.add_argument("--bookings", default="bookings.csv",
                        help="the bookings file (default bookings.csv)")
    args = parser.parse_args()
    if args.book is not None and args.cancel is not None:
        parser.error("use --book or --cancel, not both")
    if (args.book is not None or args.cancel is not None) and not args.trader:
        parser.error("--book and --cancel need --trader")
    return args


def print_day_sheet(stalls: list[Stall], market: Market, day: date) -> None:
    """Every stall, who has it that day, and the day's takings."""
    holders = {booking.stall: booking.trader
               for booking in market.bookings_on(day)}
    print(f"Market on {day}")
    in_order = sorted(stalls, key=lambda stall: stall.number)
    for stall in in_order:
        holder = holders.get(stall.number, "free")
        print(f"Stall {stall.number} ({stall.size}, £{stall.price}): {holder}")
    print(f"Takings: £{market.takings(day)}")


def main() -> None:
    args = read_arguments()
    try:
        stalls = load_stalls(args.stalls)
    except FileNotFoundError:
        print(f"Can't find {args.stalls}.", file=sys.stderr)
        sys.exit(1)
    market = Market(stalls, load_bookings(args.bookings))

    if args.book is None and args.cancel is None:
        print_day_sheet(stalls, market, args.day)
        return

    try:
        if args.book is not None:
            market.book(args.day, args.book, args.trader)
            done = f"Booked stall {args.book} for {args.trader} on {args.day}."
        else:
            market.cancel(args.day, args.cancel, args.trader)
            done = (f"Cancelled stall {args.cancel} for {args.trader} "
                    f"on {args.day}.")
    except BookingError as refusal:
        print(refusal, file=sys.stderr)
        sys.exit(1)
    save_bookings(args.bookings, market.bookings)
    print(done)


if __name__ == "__main__":
    main()
