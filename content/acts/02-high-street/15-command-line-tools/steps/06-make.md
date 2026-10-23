---
id: make
type: make
title: Make the job tool
argv_field: true
on_pass: { moss: "Bea, Ferro, Gwen. Right answers, right codes. Pip can stop asking me." }
hints:
  nudge: "Which argument is required, and which two are optional? Which values should `--status` accept?"
  plan:
    - Describe the tool
    - "Say what it takes: a customer, --status and --file"
    - Read what was typed
    - "Refuse bad values: no ledger or no jobs go to sys.stderr, exit with 1"
    - Do the job, each matching job and then the total
    - Run only when started as a program
  shape: |
    parser = argparse.ArgumentParser(description=___)
    parser.add_argument(___)
    parser.add_argument("--status", choices=___)
    parser.add_argument("--file", default=___)
    args = parser.parse_args()

    try:
        with open(args.file) as ledger:
            rows = list(csv.DictReader(ledger))
    except ___:
        print(f"Can't find {args.file}.", file=sys.stderr)
        sys.exit(___)

    matches = [row for row in rows
               if row["customer"].lower() == ___
               and (args.status is None or row["status"] == ___)]
---
Write the job tool. In the Arguments box, try `Bea`, then `Ferro --status open`, then `Gwen`.

```
$ python main.py Bea
101 oven door hinge (done, 1.5 h)
106 bread slicer (open, 2 h)
Total: 3.5 h
```

Each job's hours appear as the ledger has them; the total has one decimal place.

A missing name or `--status lost` is a usage error, and argparse deals with it, exit code 2. Your own failures go to `sys.stderr` with exit code 1:

```
No jobs for Gwen.
Can't find old.csv.
```
