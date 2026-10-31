"""Tests for the money rules. Run this file to run them all."""
from datetime import date

from money import Ledger, MoneyError, Transaction

NOV_3 = date(2026, 11, 3)


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


# At least one test for each rule. For a refusal:
#     assert refused(lambda: ledger.add(...))


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
