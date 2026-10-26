import json as _json
from datetime import date as _date

NOV_3 = _date(2026, 11, 3)
NOV_1 = _date(2026, 11, 1)
OCT_9 = _date(2026, 10, 9)


def kit(ctx, files=None):
    store = ctx.module(files=files)
    for name in ("load_ledger", "save_ledger"):
        if not callable(getattr(store, name, None)):
            raise CheckFailed(f"storage.py needs a function called {name}.")
    import money
    return store, money


def same(got, want, message):
    if got != want:
        raise CheckFailed(message, expected=repr(want), actual=repr(got))


def loading(ctx):
    store, money = kit(ctx)
    ledger = store.load_ledger("money.json")
    same(len(ledger.transactions), 16, "money.json has 16 transactions.")
    same(ledger.transactions[0], money.Transaction(_date(2026, 10, 1), 145000, "income", "shop wages"), "The first transaction in money.json.")
    same(ledger.budgets, {"food": 12000, "fun": 4000, "home": 45000}, "The budgets in money.json.")


def types_are_right(ctx):
    store, money = kit(ctx)
    first = store.load_ledger("money.json").transactions[0]
    if not isinstance(first.day, _date) or not isinstance(first.pence, int):
        raise CheckFailed("A transaction's day should be a date and its pence a whole number, not text.",
                          expected=repr(money.Transaction(_date(2026, 10, 1), 145000, "income", "shop wages")), actual=repr(first))


def save_then_load(ctx):
    store, money = kit(ctx)
    ledger = money.Ledger()
    ledger.add(NOV_3, -450, "food", "chips")
    ledger.add(NOV_1, 145000, "income", "shop wages")
    ledger.add(OCT_9, -1250, "fun", "quiz night")
    ledger.set_budget("fun", 4000)
    store.save_ledger("saved.json", ledger)
    again = store.load_ledger("saved.json")
    same(again.transactions, [money.Transaction(OCT_9, -1250, "fun", "quiz night"), money.Transaction(NOV_1, 145000, "income", "shop wages"),
                              money.Transaction(NOV_3, -450, "food", "chips")], "Loading what was saved gives the same transactions, in date order.")
    same(again.budgets, {"fun": 4000}, "And the same budgets.")


def file_is_json(ctx):
    store, money = kit(ctx)
    ledger = money.Ledger()
    ledger.add(NOV_3, -450, "food", "chips, with salt")
    store.save_ledger("saved.json", ledger)
    with open("saved.json") as saved:
        data = _json.load(saved)
    same(data.get("transactions"), [{"day": "2026-11-03", "pence": -450, "category": "food", "note": "chips, with salt"}],
         "The file should hold the transactions as the requirements show: the day as 2026-11-03, the pence as a number.")
    same(data.get("budgets"), {}, "And the budgets, even when there are none.")


def leaves_ledger_alone(ctx):
    store, money = kit(ctx)
    ledger = money.Ledger()
    ledger.add(NOV_3, -450, "food")
    ledger.add(NOV_1, 145000, "income")
    before = list(ledger.transactions)
    store.save_ledger("saved.json", ledger)
    same(ledger.transactions, before, "save_ledger reordered the ledger's own list. Sort a copy with sorted().")


def same_day_order(ctx):
    store, money = kit(ctx)
    ledger = money.Ledger()
    ledger.add(NOV_3, -2500, "fun", "fireworks")
    ledger.add(NOV_1, 145000, "income")
    ledger.add(NOV_3, -450, "food", "chips")
    store.save_ledger("saved.json", ledger)
    notes = [t.note for t in store.load_ledger("saved.json").transactions]
    same(notes, ["", "fireworks", "chips"], "Same-day transactions keep the order they were added in.")


def no_file_yet(ctx):
    store, money = kit(ctx)
    ledger = store.load_ledger("nothing-yet.json")
    same((ledger.transactions, ledger.budgets), ([], {}), "With no file yet, load_ledger gives an empty Ledger.")


def no_note_saved(ctx):
    store, money = kit(ctx, files={"old.json": _json.dumps({"transactions": [{"day": "2026-11-03", "pence": -450, "category": "food"}], "budgets": {}})})
    same(store.load_ledger("old.json").transactions, [money.Transaction(NOV_3, -450, "food", "")],
         "A transaction saved without a note loads with an empty one.")


TESTS = [
    custom("Loading money.json", loading, visible=True),
    custom("Saved, then loaded", save_then_load, visible=True),
    custom("Days are dates, pence are numbers", types_are_right,
           hint="JSON keeps the day as text. date.fromisoformat turns it back into a date."),
    custom("The file is the JSON the requirements show", file_is_json,
           hint="Turn each Transaction into a dictionary with day (as text: .isoformat()), pence, category and note."),
    custom("Saving leaves the ledger as it was", leaves_ledger_alone,
           hint="list.sort() reorders the ledger's own list. sorted() makes a new one."),
    custom("Same-day transactions keep their order", same_day_order,
           hint="sorted() keeps things that compare equal in the order they came. Sort by the day alone."),
    custom("No file yet", no_file_yet, hint="Opening a file that isn't there raises FileNotFoundError. Catch it, and give back Ledger()."),
    custom("A transaction saved without a note", no_note_saved, hint="row.get(\"note\", \"\") copes with a missing note."),
]
