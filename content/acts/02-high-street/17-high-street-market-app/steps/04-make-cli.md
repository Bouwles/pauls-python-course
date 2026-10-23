---
id: make-cli
type: make
title: The counter
files: [stalls.py, storage.py, cli.py]
entry: cli.py
starter_from: make-storage
argv_field: true
on_pass: { sanjay: "I typed a Thursday on purpose. It said no, very politely. Better manners than half the market." }
hints:
  nudge: "Which problems are argparse's to report, with exit code 2, and which are the market's, with exit code 1?"
  plan:
    - Describe the tool and its arguments
    - Read what was typed, and check --trader came with --book or --cancel
    - Load the stalls and the bookings, or say which file is missing
    - Book or cancel and save, or print the day sheet
    - "Catch BookingError: its message on stderr, exit with 1"
    - Run only when started as a program
  shape: |
    parser.add_argument("day", type=___)
    parser.add_argument("--book", type=int, metavar="STALL")
    ...
    args = parser.parse_args()
    if (args.book is not None or args.cancel is not None) and not args.trader:
        parser.___("--book and --cancel need --trader")
    ...
    try:
        market.book(args.day, args.book, args.trader)
    except BookingError as refusal:
        print(refusal, file=___)
        sys.exit(___)
    save_bookings(args.bookings, ___)
---
Now the counter, where people come in. `cli.py` is the only file that prints or exits. In the Arguments box, try `2026-11-07`, then `2026-11-07 --book 2 --trader Gwen`.

Every run here starts from the same `bookings.csv`, so a booking won't be there on the next run. The checks run it twice to see the save. On your own computer, it stays.

`type=date.fromisoformat` lets argparse turn the day into a date, and refuse one that isn't. `parser.error("...")` reports your own usage errors, with exit code 2.
