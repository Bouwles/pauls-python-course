import dataclasses as _dataclasses
from datetime import date as _date

NOV_1 = _date(2026, 11, 1)
NOV_3 = _date(2026, 11, 3)
NOV_14 = _date(2026, 11, 14)
OCT_30 = _date(2026, 10, 30)
DEC_1 = _date(2026, 12, 1)
NOV_1_LAST_YEAR = _date(2025, 11, 1)


def kit(ctx):
    mod = ctx.module()
    for name in ("Transaction", "Ledger", "MoneyError", "CATEGORIES"):
        if not hasattr(mod, name):
            raise CheckFailed(f"money.py needs {name}. Everything is listed at the top of the file.")
    return mod


def refused(mod, action, message, why):
    try:
        action()
    except mod.MoneyError as error:
        if str(error) != message:
            raise CheckFailed("Refused, but with a different message. The command line will print it, so it has to match.", expected=message, actual=str(error))
        return
    raise CheckFailed(why, expected=f"MoneyError: {message}", actual="no MoneyError")


def same(got, want, message):
    if got != want:
        raise CheckFailed(message, expected=repr(want), actual=repr(got))


def a_month(mod):
    ledger = mod.Ledger()
    ledger.add(NOV_1, 145000, "income", "shop wages")
    ledger.add(NOV_14, -3270, "food", "the big shop")
    ledger.add(NOV_3, -450, "food", "chips")
    ledger.add(NOV_3, -2500, "fun", "fireworks")
    ledger.add(OCT_30, -880, "travel", "bus to the coast")
    return ledger


def add_one(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    made = ledger.add(NOV_3, -450, "food", "chips")
    same(made, mod.Transaction(NOV_3, -450, "food", "chips"), "add should return the new Transaction.")
    same(ledger.transactions, [mod.Transaction(NOV_3, -450, "food", "chips")], "After adding, ledger.transactions should hold it.")
    same(ledger.add(NOV_1, 145000, "income").note, "", "A transaction with no note has an empty one.")


def the_balance(ctx):
    mod = kit(ctx)
    same(a_month(mod).balance(), 145000 - 3270 - 450 - 2500 - 880, "The balance is everything in, less everything out.")
    same(mod.Ledger().balance(), 0, "An empty ledger has a balance of 0.")


def are_dataclasses(ctx):
    mod = kit(ctx)
    if not _dataclasses.is_dataclass(mod.Transaction):
        raise CheckFailed("Transaction should be a dataclass.")
    t = mod.Transaction(NOV_3, -450, "food")
    try:
        t.pence = 0
    except _dataclasses.FrozenInstanceError:
        return
    raise CheckFailed("Transaction should be frozen: a transaction that's happened doesn't change.")


def nothing_at_all(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    refused(mod, lambda: ledger.add(NOV_3, 0, "food"), "An amount can't be 0.", "A transaction of nothing went through.")
    same(ledger.transactions, [], "A refused transaction isn't added.")


def no_such_category(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    refused(mod, lambda: ledger.add(NOV_3, -120, "sweets"), "There's no category called sweets.", "Spending on sweets went through, but sweets isn't a category.")
    same(ledger.transactions, [], "A refused transaction isn't added.")


def income_is_in(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    refused(mod, lambda: ledger.add(NOV_1, -145000, "income"), "Income is money in, so it has to be more than 0.",
            "Income of less than 0 went through.")


def spending_is_out(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    refused(mod, lambda: ledger.add(NOV_3, 450, "food"), "Spending on food is money out, so it has to be less than 0.",
            "Spending of more than 0 went through.")
    refused(mod, lambda: ledger.add(NOV_3, 880, "travel"), "Spending on travel is money out, so it has to be less than 0.",
            "Spending of more than 0 went through.")


def remove_one(ctx):
    mod = kit(ctx)
    ledger = a_month(mod)
    chips = mod.Transaction(NOV_3, -450, "food", "chips")
    ledger.remove(chips)
    same(chips in ledger.transactions, False, "After remove, the transaction has gone.")
    same(len(ledger.transactions), 4, "remove takes out that one and nothing else.")
    refused(mod, lambda: ledger.remove(chips), "That transaction isn't in the ledger.", "Removing it a second time should be refused.")


def budgets(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    ledger.set_budget("food", 12000)
    ledger.set_budget("fun", 4000)
    same(ledger.budgets, {"food": 12000, "fun": 4000}, "set_budget should keep each category's budget.")
    ledger.set_budget("food", 10000)
    same(ledger.budgets["food"], 10000, "Setting a budget again replaces it.")


def bad_budgets(ctx):
    mod = kit(ctx)
    ledger = mod.Ledger()
    refused(mod, lambda: ledger.set_budget("income", 5000), "There's no spending category called income.",
            "Income got a budget, but it isn't spending.")
    refused(mod, lambda: ledger.set_budget("sweets", 500), "There's no spending category called sweets.",
            "sweets got a budget, but it isn't a category.")
    refused(mod, lambda: ledger.set_budget("food", 0), "A budget has to be more than 0.", "A budget of 0 went through.")
    same(ledger.budgets, {}, "Refused budgets aren't kept.")


def one_month(ctx):
    mod = kit(ctx)
    ledger = a_month(mod)
    ledger.add(NOV_1_LAST_YEAR, -100, "fun", "last year")
    want = [mod.Transaction(NOV_1, 145000, "income", "shop wages"), mod.Transaction(NOV_3, -450, "food", "chips"),
            mod.Transaction(NOV_3, -2500, "fun", "fireworks"), mod.Transaction(NOV_14, -3270, "food", "the big shop")]
    same(ledger.in_month(2026, 11), want, "in_month gives only that month of that year, in date order. Same-day ones keep the order they were added.")
    same(ledger.in_month(2026, 12), [], "A month with nothing in it.")


def spent(ctx):
    mod = kit(ctx)
    ledger = a_month(mod)
    got = ledger.spending(2026, 11)
    same(got, {"food": 3720, "fun": 2500}, "spending adds up each category's money out that month, as positive pence.")
    same(list(got), ["food", "fun"], "spending's categories come in alphabetical order.")
    same(ledger.spending(2026, 12), {}, "A month with no spending.")


def over(ctx):
    mod = kit(ctx)
    ledger = a_month(mod)
    ledger.set_budget("food", 3000)
    ledger.set_budget("fun", 2500)
    ledger.set_budget("travel", 500)
    same(ledger.over_budget(2026, 11), ["food"], "Food spent 37.20 of 30.00. Fun spent exactly its budget, which isn't over. Travel's bus was in October.")
    same(ledger.over_budget(2026, 10), ["travel"], "In October, the bus to the coast was over the travel budget.")


def ledgers_dont_share(ctx):
    mod = kit(ctx)
    first = mod.Ledger()
    first.add(NOV_3, -450, "food")
    first.set_budget("food", 12000)
    second = mod.Ledger()
    same((second.transactions, second.budgets), ([], {}), "A brand new ledger should have no transactions and no budgets.")


def keeps_own_copies(ctx):
    mod = kit(ctx)
    saved = [mod.Transaction(NOV_1, 145000, "income")]
    plans = {"food": 12000}
    ledger = mod.Ledger(saved, plans)
    ledger.add(NOV_3, -450, "food")
    ledger.set_budget("fun", 4000)
    same((len(saved), plans), (1, {"food": 12000}), "Adding changed the list or dictionary that was passed in to Ledger.")
    same(ledger.balance(), 145000 - 450, "Transactions passed in at the start count in the balance.")


TESTS = [
    custom("Adding a transaction", add_one, visible=True),
    custom("The balance", the_balance, visible=True),
    custom("Transaction is a frozen dataclass", are_dataclasses,
           hint="@dataclass(frozen=True) above the class, with the fields in the order the requirements give, and note defaulting to \"\"."),
    custom("Nothing isn't a transaction", nothing_at_all, hint="Check the amount first: 0 is refused."),
    custom("Only the six categories", no_such_category, hint="category in CATEGORIES says whether it's one of them."),
    custom("Income is money in", income_is_in),
    custom("Spending is money out", spending_is_out,
           hint="Every category except income is spending, so its amount is less than 0. The message names the category."),
    custom("Taking one out", remove_one,
           hint="A frozen dataclass compares by its fields, so in and .remove() find it."),
    custom("Budgets", budgets),
    custom("Budgets that can't be", bad_budgets,
           hint="Income isn't spending, so it can't have a budget, and nor can a category that doesn't exist."),
    custom("One month, in date order", one_month,
           hint="Keep the transactions with that year and that month, then sorted() with key=lambda t: t.day."),
    custom("Spending by category", spent,
           hint="Only money out counts, as a positive number. Build the totals with .get(category, 0), then give them back in sorted order."),
    custom("Over budget", over, hint="More than the budget is over. Exactly the budget isn't."),
    custom("Two ledgers don't share", ledgers_dont_share,
           hint="A default of [] or {} in __init__ is made once and shared by every Ledger. Default to None, and make new ones inside."),
    custom("The ledger keeps its own copies", keeps_own_copies,
           hint="list(transactions) and dict(budgets) give the ledger its own copies, so the caller's are left alone."),
]
