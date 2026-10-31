---
id: make-storage
type: make
title: The money file
files: [money.py, storage.py]
entry: storage.py
starter_from: make-money
on_pass: { riya: "Saved, closed, opened again, and every penny where I left it. Better than my spreadsheet ever managed." }
hints:
  nudge: "What does JSON do with a date? What type does `Transaction` need its day to be?"
  plan:
    - Open the file with with, and read it with json.load
    - Turn each saved dictionary back into a Transaction, with a real date
    - Give back an empty Ledger when the file isn't there yet
    - Sort a copy by day, turn each transaction into a dictionary, and json.dump it
  shape: |
    def load_ledger(path):
        try:
            with open(path) as money_file:
                data = json.___(money_file)
        except ___:
            return Ledger()
        transactions = [Transaction(date.___(row["day"]), row["pence"], row["category"], row.get("note", ___))
                        for row in data.get("transactions", [])]
        return Ledger(transactions, data.get("budgets", {}))


    def save_ledger(path, ledger):
        in_order = sorted(ledger.transactions, key=lambda t: ___)
        data = {"transactions": [{"day": t.day.___(), "pence": t.pence, "category": t.category, "note": t.note}
                                 for t in in_order],
                "budgets": ledger.budgets}
        with open(path, "w") as money_file:
            json.dump(data, money_file, indent=2)
---
Now the file. `storage.py` turns the JSON in `money.json` into a `Ledger` and back again. Your `money.py` comes with you from the last step.

`money.json` is already on the workbench: a made-up student's October and November, which Riya typed in to test with. JSON has no dates, so a day goes into the file as text, `2026-11-03`, and `date.fromisoformat` reads it back.

The hidden checks save transactions on the same day, look at the file itself, and load a money file that isn't there yet.
