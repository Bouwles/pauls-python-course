import types as _types


def load_tests(ctx, tides_source=None):
    files = {} if tides_source is None else {"tides.py": tides_source}
    module = ctx.module(files=files)
    tests = [(name, value) for name, value in vars(module).items()
             if name.startswith("test_") and isinstance(value, _types.FunctionType)]
    if not tests:
        raise CheckFailed("There are no test_ functions in test_tides.py.")
    return tests


def failures(tests):
    failed = []
    for name, test in tests:
        try:
            test()
        except Exception as problem:
            failed.append((name, problem))
    return failed


def mutant(source, old, new):
    if old not in source:
        raise RuntimeError("content bug: the text to break is not in tides.py: " + old)
    return source.replace(old, new)


def passes_on(source, who):
    def check(ctx):
        failed = failures(load_tests(ctx, source))
        if failed:
            name, problem = failed[0]
            if source is None:
                message = f"{name} fails on your tides.py. Either the test or the code is wrong: run test_tides.py and read the FAILED line."
            else:
                message = f"{name} fails on {who}, which is right. Check the answer it expects."
            raise CheckFailed(message, actual=f"{type(problem).__name__}: {problem}")
    return check


def catches(source, what, old, new):
    broken = mutant(source, old, new)

    def check(ctx):
        if not failures(load_tests(ctx, broken)):
            raise CheckFailed(f"Every test passed on a tides.py where {what}. A test that can't fail isn't checking anything.")
    return check


TIDES = '# Tide times for the north quay. A. Penhallow.\n# I never wrote tests for the thing on the hill. It passes everything\n# I ask it, which is either very good news or the worst kind. A.P.\n\nTIDE_GAP = 12 * 60 + 25     # high water to the next high water, in minutes\nEBB = 6 * 60 + 13           # high water to the low water after it\nDAY = 24 * 60\n\n\ndef to_minutes(time):\n    """\'06:42\' -> 402, minutes after midnight."""\n    hours, mins = time.split(":")\n    return int(hours) * 60 + int(mins)\n\n\ndef to_clock(minutes):\n    """402 -> \'06:42\'. Times past midnight wrap round to the next morning."""\n    minutes = minutes % DAY\n    return f"{minutes // 60:02}:{minutes % 60:02}"\n\n\ndef next_high(high):\n    """The high water after this one."""\n    return to_clock(to_minutes(high) + TIDE_GAP)\n\n\ndef low_after(high):\n    """The low water after a high water."""\n    return to_clock(to_minutes(high) + EBB)\n'


TESTS = [
    custom("Every test passes on Penhallow's tides.py", passes_on(TIDES, "Penhallow's tides.py"), visible=True),
    custom("Your tests notice a to_minutes that gets the hours wrong",
           catches(TIDES, "to_minutes counts 100 minutes to the hour", "int(hours) * 60", "int(hours) * 100"), visible=True,
           hint="Assert what to_minutes(\"06:42\") really is: 402."),
    custom("Your tests notice a to_clock that drops the leading zero",
           catches(TIDES, "to_clock writes 6:42, not 06:42", "{minutes // 60:02}:{minutes % 60:02}", "{minutes // 60}:{minutes % 60}"),
           hint="Compare to_clock(402) with the text \"06:42\", worked out by hand, not with to_clock(402)."),
    custom("Your tests notice a to_clock that forgets midnight",
           catches(TIDES, "to_clock forgets that days end", "    minutes = minutes % DAY\n", ""),
           hint="Test an edge: what should to_clock(1500) be, the morning after?"),
    custom("Your tests notice a next_high that is 25 minutes early",
           catches(TIDES, "the tide gap is a flat 12 hours", "TIDE_GAP = 12 * 60 + 25", "TIDE_GAP = 12 * 60"),
           hint="The comma in assert x, y makes y a message, not something to compare. Use ==."),
    custom("Your tests notice a low_after that is 18 minutes late",
           catches(TIDES, "the ebb takes 6 hours 31 minutes", "EBB = 6 * 60 + 13", "EBB = 6 * 60 + 31"),
           hint="assert result only checks that result isn't empty. Compare it with \"12:55\"."),
]
