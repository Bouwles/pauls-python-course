---
id: make-cli
type: make
title: The counter
files: [money.py, storage.py, cli.py]
entry: cli.py
starter_from: make-storage
argv_field: true
on_pass: { sanjay: "I tried to spend money on sweets. It said there's no such thing. My dentist will be delighted." }
hints:
  nudge: "Which problems are argparse's to report, with exit code 2, and which are the ledger's, with exit code 1?"
  plan:
    - Describe the tool, its commands and their arguments
    - Read what was typed
    - Load the ledger
    - Do the command, and save if it changed anything
    - "Catch MoneyError: its message on stderr, exit with 1"
    - Run only when started as a program
  shape: |
    commands = parser.add_subparsers(dest="command", required=True)
    adding = commands.add_parser("add")
    adding.add_argument("day", type=___)
    adding.add_argument("amount", type=___)
    adding.add_argument("category")
    adding.add_argument("--note", default="")
    ...
    try:
        transaction = ledger.add(args.day, args.amount, args.category, args.note)
    except MoneyError as refusal:
        print(refusal, file=___)
        sys.exit(___)
    save_ledger(args.file, ___)
---
Now the counter, where Sanjay comes in. `cli.py` is the only file that prints or exits. In the Arguments box, try `report 2026-11`, then `add 2026-11-22 -3.20 food --note pasty`, then the report again.

`pence_from` and `money` are written for you: one turns pounds typed in into pence, the other turns pence back into pounds for people. Write `month_from` for the report's month, raising a `ValueError` for a month that isn't 1 to 12, so argparse can refuse it.

A negative amount like `-3.20` looks like an option, but argparse knows a number when it sees one.
