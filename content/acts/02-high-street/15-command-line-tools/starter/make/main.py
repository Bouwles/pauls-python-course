# The workshop job tool: a customer's jobs from the ledger, then the total.
import argparse
import csv
import sys

# Describe the tool
# Say what it takes: a customer, --status (open or done),
#     and --file (default jobs.csv)
# Read what was typed
# Refuse bad values: say why on sys.stderr, exit with 1
# Do the job: print each matching job, then the total
# Run only when started as a program
