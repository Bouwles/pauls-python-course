import csv
import sys

customer = sys.argv[0]

total = 0
with open("jobs.csv") as ledger:
    for row in csv.DictReader(ledger):
        if row["customer"] == customer:
            total += float(row["hours"])

if total == 0:
    print(f"No jobs for {customer}.")
    sys.exit(0)

print(f"{customer}: {total} hours")
