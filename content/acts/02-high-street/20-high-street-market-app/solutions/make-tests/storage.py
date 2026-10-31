"""Reading and writing the money file. The rules live in money.py."""
import json
from datetime import date

from money import Ledger, Transaction


def load_ledger(path: str) -> Ledger:
    """The ledger in a JSON file, or an empty one if the file isn't there yet."""
    try:
        with open(path) as money_file:
            data = json.load(money_file)
    except FileNotFoundError:
        return Ledger()
    transactions = [Transaction(date.fromisoformat(row["day"]), row["pence"], row["category"], row.get("note", ""))
                    for row in data.get("transactions", [])]
    return Ledger(transactions, data.get("budgets", {}))


def save_ledger(path: str, ledger: Ledger) -> None:
    """Write the ledger as JSON: the transactions in date order, then the budgets."""
    in_order = sorted(ledger.transactions, key=lambda transaction: transaction.day)
    data = {
        "transactions": [{"day": t.day.isoformat(), "pence": t.pence, "category": t.category, "note": t.note}
                         for t in in_order],
        "budgets": ledger.budgets,
    }
    with open(path, "w") as money_file:
        json.dump(data, money_file, indent=2)
