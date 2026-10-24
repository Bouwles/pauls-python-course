"""Tests for Mrs Vance's fines. Run this file to run them all."""
from fines import fine


def test_on_time():
    assert fine(0) == 0


# A stand-in for pytest: run every test_ function and say how it went.
if __name__ == "__main__":
    for name, test in list(globals().items()):
        if name.startswith("test_"):
            try:
                test()
                print("passed", name)
            except Exception as problem:
                print("FAILED", name, type(problem).__name__, problem)
