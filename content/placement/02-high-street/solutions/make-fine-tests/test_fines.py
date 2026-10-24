"""Tests for Mrs Vance's fines. Run this file to run them all."""
from fines import fine


def test_on_time():
    assert fine(0) == 0


def test_two_days_late_is_forgiven():
    assert fine(2) == 0


def test_three_days_late_pays_for_all_three():
    assert fine(3) == 30


def test_a_fortnight_late():
    assert fine(14) == 140


def test_the_cap():
    assert fine(30) == 300
    assert fine(90) == 300


def test_childrens_books_are_half():
    assert fine(14, childrens=True) == 70


def test_childrens_half_comes_after_the_cap():
    assert fine(90, childrens=True) == 150


def test_childrens_grace():
    assert fine(2, childrens=True) == 0


def test_negative_days_are_refused():
    try:
        fine(-1)
    except ValueError:
        return
    assert False, "fine(-1) should raise ValueError"


# A stand-in for pytest: run every test_ function and say how it went.
if __name__ == "__main__":
    for name, test in list(globals().items()):
        if name.startswith("test_"):
            try:
                test()
                print("passed", name)
            except Exception as problem:
                print("FAILED", name, type(problem).__name__, problem)
