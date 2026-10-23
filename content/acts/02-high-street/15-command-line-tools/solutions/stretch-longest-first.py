# The workshop job tool: a customer's jobs from the ledger, then the total.
import argparse
import csv
import sys


def main():
    parser = argparse.ArgumentParser(
        description="Jobs in Moss's workshop ledger."
    )
    parser.add_argument("customer", help="whose jobs to show")
    parser.add_argument("--status", choices=["open", "done"],
                        help="only open jobs, or only done ones")
    parser.add_argument("--file", default="jobs.csv",
                        help="the ledger (default jobs.csv)")
    parser.add_argument("--longest", action="store_true",
                        help="the most hours first")
    args = parser.parse_args()

    try:
        with open(args.file) as ledger:
            rows = list(csv.DictReader(ledger))
    except FileNotFoundError:
        print(f"Can't find {args.file}.", file=sys.stderr)
        sys.exit(1)

    wanted = args.customer.lower()
    matches = [
        row for row in rows
        if row["customer"].lower() == wanted
        and (args.status is None or row["status"] == args.status)
    ]
    if not matches:
        print(f"No jobs for {args.customer}.", file=sys.stderr)
        sys.exit(1)

    if args.longest:
        matches = sorted(matches, key=lambda row: float(row["hours"]),
                         reverse=True)
    for row in matches:
        details = f"({row['status']}, {row['hours']} h)"
        print(f"{row['number']} {row['item']} {details}")
    total = sum(float(row["hours"]) for row in matches)
    print(f"Total: {total:.1f} h")


if __name__ == "__main__":
    main()
