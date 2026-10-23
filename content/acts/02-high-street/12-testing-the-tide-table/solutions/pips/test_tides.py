from tides import to_minutes, to_clock, next_high, low_after


def test_minutes():
    assert to_minutes("06:42") == 402


def test_clock():
    assert to_clock(402) == "06:42"


def test_clock_after_midnight():
    assert to_clock(1500) == "01:00"


def test_next_high():
    assert next_high("06:42") == "19:07"


def test_next_high_past_midnight():
    assert next_high("18:00") == "06:25"


def test_low_after():
    assert low_after("06:42") == "12:55"


# A stand-in for pytest: run every test_ function and say how it went.
# At home, delete these lines and type pytest instead.
if __name__ == "__main__":
    for name, test in list(globals().items()):
        if name.startswith("test_"):
            try:
                test()
                print("passed", name)
            except Exception as problem:
                print("FAILED", name, type(problem).__name__, problem)
