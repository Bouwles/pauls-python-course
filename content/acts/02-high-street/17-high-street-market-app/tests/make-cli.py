STALLS = "number,size,price\n1,small,12\n2,small,12\n3,large,20\n"
BOOKINGS = "day,stall,trader\n2026-11-07,1,Sanjay\n2026-11-14,3,Bea\n"
FILES = {"stalls.csv": STALLS, "bookings.csv": BOOKINGS}

SHEET = "Market on 2026-11-07\nStall 1 (small, £12): Sanjay\nStall 2 (small, £12): free\nStall 3 (large, £20): free\nTakings: £12"
EMPTY_SHEET = "Market on 2026-11-07\nStall 1 (small, £12): free\nStall 2 (small, £12): free\nStall 3 (large, £20): free\nTakings: £0"
REAL_SHEET = """Market on 2026-11-07
Stall 1 (small, £12): Sanjay
Stall 2 (small, £12): free
Stall 3 (large, £20): Bea
Stall 4 (small, £12): free
Stall 5 (large, £20): free
Stall 6 (small, £12): free
Stall 7 (small, £12): free
Stall 8 (large, £20): free
Stall 9 (small, £12): free
Stall 10 (small, £12): free
Stall 11 (large, £20): free
Stall 12 (small, £12): free
Stall 14 (large, £25): Okonjo
Takings: £57"""


def stderr_of(result):
    return "".join(text for kind, text in result.session.transcript.parts if kind == "err")


def run(ctx, argv, files=FILES):
    result = ctx.run_program(argv=argv, files=files)
    if result.error is not None:
        raise CheckFailed(f"cli.py crashed: {type(result.error).__name__}: {result.error}")
    return result


def saved_lines(result):
    if "bookings.csv" not in result.files_out:
        raise CheckFailed("bookings.csv wasn't saved.", expected="bookings.csv written", actual="no change to bookings.csv")
    return result.files_out["bookings.csv"].splitlines()


def refusal(ctx, argv, message):
    result = run(ctx, argv)
    if result.exit_code != 1:
        raise CheckFailed(f"A broken rule should finish with exit code 1, not {result.exit_code}.", expected=message, actual=(result.output + stderr_of(result)).strip())
    if message not in stderr_of(result):
        raise CheckFailed("The BookingError's message should go to sys.stderr.", expected=message, actual=stderr_of(result).strip() or "(nothing on stderr)")
    if result.output.strip():
        raise CheckFailed("A refusal shouldn't print anything on the normal output.", expected="(nothing)", actual=result.output.strip())
    if "bookings.csv" in result.files_out:
        raise CheckFailed("Nothing should be saved after a refusal.", expected=BOOKINGS, actual=result.files_out["bookings.csv"])


def booking_is_saved(ctx):
    booked = run(ctx, ["2026-11-07", "--book", "2", "--trader", "Gwen"])
    lines = saved_lines(booked)
    for row in ("2026-11-07,1,Sanjay", "2026-11-07,2,Gwen", "2026-11-14,3,Bea"):
        if row not in lines:
            raise CheckFailed("The saved file should hold every booking, the new one included.", expected=row, actual="\n".join(lines))
    later = run(ctx, ["2026-11-07"], files={"stalls.csv": STALLS, "bookings.csv": booked.files_out["bookings.csv"]})
    if "Stall 2 (small, £12): Gwen" not in later.output:
        raise CheckFailed("Run again with the saved file, the day sheet should show Gwen on stall 2.", expected="Stall 2 (small, £12): Gwen", actual=later.output)


def taken_stall(ctx):
    refusal(ctx, ["2026-11-07", "--book", "1", "--trader", "Gwen"], "Stall 1 is already booked on 2026-11-07.")


def not_saturday(ctx):
    refusal(ctx, ["2026-11-10", "--book", "2", "--trader", "Gwen"], "The market is only on Saturdays.")


def cancelling(ctx):
    result = run(ctx, ["2026-11-07", "--cancel", "1", "--trader", "Sanjay"])
    if result.output.strip() != "Cancelled stall 1 for Sanjay on 2026-11-07.":
        raise CheckFailed("Cancelling should say what was cancelled.", expected="Cancelled stall 1 for Sanjay on 2026-11-07.", actual=result.output.strip())
    lines = saved_lines(result)
    if "2026-11-07,1,Sanjay" in lines or "2026-11-14,3,Bea" not in lines:
        raise CheckFailed("The saved file should lose Sanjay's booking and keep Bea's.", expected="day,stall,trader\n2026-11-14,3,Bea", actual="\n".join(lines))


def cancel_nothing(ctx):
    refusal(ctx, ["2026-11-07", "--cancel", "2", "--trader", "Gwen"], "Gwen has no booking for stall 2 on 2026-11-07.")


def no_stalls_file(ctx):
    result = run(ctx, ["2026-11-07", "--stalls", "old.csv"])
    if result.exit_code != 1 or "Can't find old.csv." not in stderr_of(result):
        raise CheckFailed("A missing stalls file: say Can't find NAME. on stderr and exit with 1.", expected="Can't find old.csv. (exit code 1)", actual=f"{(result.output + stderr_of(result)).strip() or '(nothing)'} (exit code {result.exit_code})")


TESTS = [
    output("The day sheet", argv=["2026-11-07"], files=FILES, expect=SHEET, exit_code=0, visible=True),
    output("Booking a stall", argv=["2026-11-07", "--book", "2", "--trader", "Gwen"], files=FILES,
           expect="Booked stall 2 for Gwen on 2026-11-07.", exit_code=0, visible=True),
    custom("The booking is saved, with all the others", booking_is_saved,
           hint="Book, then save market.bookings: every booking from every day, not just today's."),
    custom("A taken stall is refused", taken_stall,
           hint="Catch BookingError, print it with file=sys.stderr, exit with 1, and save nothing."),
    custom("Not a Saturday", not_saturday,
           hint="The market's own rules refuse it. cli.py only has to pass the message on, on stderr, with exit code 1."),
    custom("Cancelling, and saving it", cancelling,
           hint="--cancel calls market.cancel, then saves and prints Cancelled stall N for NAME on DAY."),
    custom("Cancelling what isn't there", cancel_nothing,
           hint="market.cancel raises BookingError. Catch it the same way as for book."),
    output("--book without --trader", argv=["2026-11-07", "--book", "2"], files=FILES, expect="", exit_code=2,
           hint="After parse_args, if --book or --cancel came without --trader, call parser.error(\"...\"). It exits with 2."),
    output("--book and --cancel together", argv=["2026-11-07", "--book", "2", "--cancel", "1", "--trader", "Gwen"], files=FILES, expect="", exit_code=2,
           hint="One job at a time: parser.error if both --book and --cancel are given."),
    output("A day that isn't a date", argv=["2026-13-40"], files=FILES, expect="", exit_code=2,
           hint="type=date.fromisoformat lets argparse turn the day into a date, and refuse one that isn't."),
    output("No day at all", argv=[], files=FILES, expect="", exit_code=2,
           hint="The day is a required argument: argparse stops with exit code 2 if it's missing."),
    output("A stall that isn't a number", argv=["2026-11-07", "--book", "two", "--trader", "Gwen"], files=FILES, expect="", exit_code=2,
           hint="type=int on --book and --cancel makes argparse refuse a stall that isn't a number."),
    custom("No stalls file", no_stalls_file,
           hint="load_stalls raises FileNotFoundError. Catch it in cli.py, say Can't find NAME. on stderr, exit with 1."),
    output("No bookings file yet", argv=["2026-11-07", "--bookings", "new.csv"], files=FILES, expect=EMPTY_SHEET, exit_code=0,
           hint="A bookings file that isn't there yet means an empty market. load_bookings already gives back []."),
    output("The real market", argv=["2026-11-07"], expect=REAL_SHEET, exit_code=0,
           hint="Stalls in number order, 12 then 14, with the real stalls.csv and bookings.csv."),
    output("--help works", argv=["--help"], files=FILES, expect="usage:", match="contains", exit_code=0,
           hint="argparse writes --help for you, as long as cli.py uses argparse.ArgumentParser."),
]
