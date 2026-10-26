"""Tests for Sanjay's money rules. Run this file to run them all."""
from datetime import date

from finance.money import Ledger, MoneyError, Transaction

NOV_1 = date(2026, 11, 1)
NOV_3 = date(2026, 11, 3)
NOV_1_LAST_YEAR = date(2025, 11, 1)


def refused(action):
    """True if calling action() raises MoneyError."""
    try:
        action()
    except MoneyError:
        return True
    return False


def test_adding_spending():
    ledger = Ledger()
    ledger.add(NOV_3, -450, "food", "chips")
    assert ledger.transactions == [Transaction(NOV_3, -450, "food", "chips")]


def test_nothing_is_refused():
    ledger = Ledger()
    assert refused(lambda: ledger.add(NOV_3, 0, "food"))


def test_only_real_categories():
    ledger = Ledger()
    assert refused(lambda: ledger.add(NOV_3, -120, "sweets"))


def test_income_is_money_in():
    ledger = Ledger()
    assert refused(lambda: ledger.add(NOV_1, -145000, "income"))
    ledger.add(NOV_1, 145000, "income")
    assert ledger.balance() == 145000


def test_spending_is_money_out():
    ledger = Ledger()
    assert refused(lambda: ledger.add(NOV_3, 450, "food"))


def test_balance():
    ledger = Ledger()
    ledger.add(NOV_1, 145000, "income")
    ledger.add(NOV_3, -450, "food")
    assert ledger.balance() == 144550


def test_one_month_only():
    ledger = Ledger()
    ledger.add(NOV_3, -450, "food")
    ledger.add(NOV_1_LAST_YEAR, -100, "fun")
    assert ledger.in_month(2026, 11) == [Transaction(NOV_3, -450, "food")]


def test_spending_by_category():
    ledger = Ledger()
    ledger.add(NOV_1, 145000, "income")
    ledger.add(NOV_3, -450, "food")
    ledger.add(NOV_3, -320, "food")
    ledger.add(NOV_3, -2500, "fun")
    assert ledger.spending(2026, 11) == {"food": 770, "fun": 2500}


def test_exactly_the_budget_is_not_over():
    ledger = Ledger()
    ledger.set_budget("food", 450)
    ledger.add(NOV_3, -450, "food")
    assert ledger.over_budget(2026, 11) == []
    ledger.add(NOV_3, -1, "food")
    assert ledger.over_budget(2026, 11) == ["food"]


def test_leaves_my_list_alone():
    saved = [Transaction(NOV_1, 145000, "income")]
    ledger = Ledger(saved)
    ledger.add(NOV_3, -450, "food")
    assert len(saved) == 1


if __name__ == "__main__":
    tests = [test for name, test in sorted(globals().items())
             if name.startswith("test_")]
    failed = 0
    for test in tests:
        try:
            test()
        except Exception as error:
            failed += 1
            print(f"FAILED {test.__name__}: {error!r}")
    print(f"{len(tests) - failed} passed, {failed} failed")
