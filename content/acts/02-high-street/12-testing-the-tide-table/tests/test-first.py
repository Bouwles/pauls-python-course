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


REFERENCE = '# Tide times for the north quay. A. Penhallow.\n# I never wrote tests for the thing on the hill. It passes everything\n# I ask it, which is either very good news or the worst kind. A.P.\n\nTIDE_GAP = 12 * 60 + 25     # high water to the next high water, in minutes\nEBB = 6 * 60 + 13           # high water to the low water after it\nDAY = 24 * 60\n\n\ndef to_minutes(time):\n    """\'06:42\' -> 402, minutes after midnight."""\n    hours, mins = time.split(":")\n    return int(hours) * 60 + int(mins)\n\n\ndef to_clock(minutes):\n    """402 -> \'06:42\'. Times past midnight wrap round to the next morning."""\n    minutes = minutes % DAY\n    return f"{minutes // 60:02}:{minutes % 60:02}"\n\n\ndef next_high(high):\n    """The high water after this one."""\n    return to_clock(to_minutes(high) + TIDE_GAP)\n\n\ndef low_after(high):\n    """The low water after a high water."""\n    return to_clock(to_minutes(high) + EBB)\n\n\ndef can_cross(depth, draught, margin=0.5):\n    """True when a boat drawing `draught` metres can cross the bar at `depth` metres.\n\n    The depth must be at least the draught plus the margin.\n    """\n    return round(depth - draught, 2) >= margin\n\n\ndef high_waters(first, count):\n    """A list of count high water times, starting with first."""\n    times = []\n    high = first\n    while len(times) < count:\n        times.append(high)\n        high = next_high(high)\n    return times\n'

GOOD = "    return round(depth - draught, 2) >= margin"


TESTS = [
    custom("Your tests pass on a can_cross that is right", passes_on(REFERENCE, "Moss's can_cross"), visible=True,
           hint="One of your tests expects something the requirement doesn't say. Check its answer against the brief."),
    custom("Your tests notice a can_cross that always says yes",
           catches(REFERENCE, "can_cross always says yes", GOOD, "    return True"), visible=True,
           hint="Test a boat that can't cross: depth 2.2, draught 2.0."),
    custom("Your tests notice a can_cross that always says no",
           catches(REFERENCE, "can_cross always says no", GOOD, "    return False"),
           hint="Test a boat that can cross, too."),
    custom("Your tests notice a can_cross that forgets the margin",
           catches(REFERENCE, "can_cross only checks the depth beats the draught", GOOD, "    return depth >= draught"),
           hint="Test a boat with a little water under her, but less than the margin: depth 2.2, draught 2.0."),
    custom("Your tests notice a can_cross that is wrong at the boundary",
           catches(REFERENCE, "can_cross uses > instead of >=", GOOD, "    return round(depth - draught, 2) > margin"),
           hint="Test the boundary: a depth of exactly the draught plus the margin can cross. Try depth 2.5, draught 2.0."),
    custom("Your tests notice a can_cross that ignores the margin it's given",
           catches(REFERENCE, "can_cross always uses half a metre", GOOD, "    return round(depth - draught, 2) >= 0.5"),
           hint="Test a call that names its own margin, like a cautious skipper's margin=1.0."),
]
