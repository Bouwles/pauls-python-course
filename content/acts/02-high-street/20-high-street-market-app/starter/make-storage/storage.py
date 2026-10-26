"""Reading and writing Sanjay's money file. The rules live in money.py.

The file is JSON, like this:

    {
      "transactions": [
        {"day": "2026-11-03", "pence": -450, "category": "food", "note": "chips"}
      ],
      "budgets": {"food": 12000}
    }

load_ledger(path)              a Ledger made from the file. A file that isn't
                               there yet means nothing so far: an empty Ledger.
save_ledger(path, ledger)      writes the file: the transactions in date order
                               (same-day ones in the order they were added), then
                               the budgets. It doesn't reorder the ledger itself.
"""
import json
from datetime import date

from money import Ledger, Transaction
