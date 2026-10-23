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


def their(ctx, name):
    module = _types.ModuleType("learner_tides")
    exec(compile(ctx.files.get("tides.py", ""), "tides.py", "exec"), module.__dict__)
    if not hasattr(module, name):
        raise CheckFailed(f"There is no function called {name} in tides.py.")
    return getattr(module, name)


def same(what, got, want):
    if got != want or type(got) is not type(want):
        raise CheckFailed(what, expected=want, actual=got)


def kittiwake(ctx):
    can_cross = their(ctx, "can_cross")
    same("can_cross(3.0, 2.0): a metre under her keel", can_cross(3.0, 2.0), True)
    same("can_cross(2.0, 2.0): no water under her at all", can_cross(2.0, 2.0), False)


def boundary(ctx):
    can_cross = their(ctx, "can_cross")
    same("can_cross(2.5, 2.0): exactly the margin", can_cross(2.5, 2.0), True)
    same("can_cross(2.25, 2.0): a quarter of a metre short", can_cross(2.25, 2.0), False)


def own_margin(ctx):
    can_cross = their(ctx, "can_cross")
    same("can_cross(3.0, 2.0, margin=1.0)", can_cross(3.0, 2.0, margin=1.0), True)
    same("can_cross(2.75, 2.0, margin=1.0)", can_cross(2.75, 2.0, margin=1.0), False)


def three_tides(ctx):
    high_waters = their(ctx, "high_waters")
    same("high_waters(\"06:42\", 3)", high_waters("06:42", 3), ["06:42", "19:07", "07:32"])


def past_midnight(ctx):
    high_waters = their(ctx, "high_waters")
    same("high_waters(\"23:50\", 2)", high_waters("23:50", 2), ["23:50", "12:15"])


def none_or_one(ctx):
    high_waters = their(ctx, "high_waters")
    same("high_waters(\"06:42\", 0)", high_waters("06:42", 0), [])
    same("high_waters(\"05:10\", 1)", high_waters("05:10", 1), ["05:10"])


FIRST = "    high = first\n"
LOOP = "    while len(times) < count:"


TESTS = [
    custom("Every test in test_tides.py passes on your tides.py", passes_on(None, "your tides.py"), visible=True,
           hint="Run test_tides.py and read the FAILED lines: each names the test and what went wrong."),
    custom("The Kittiwake at the bar", kittiwake, visible=True),
    custom("Exactly at the margin", boundary,
           hint="At exactly the draught plus the margin, she can cross: use >=."),
    custom("A skipper's own margin", own_margin,
           hint="Use the margin parameter, not 0.5 written into the sum."),
    custom("Three high waters from 06:42", three_tides,
           hint="Start the list with first, then keep adding the next high water after the last one."),
    custom("High waters past midnight", past_midnight,
           hint="next_high already wraps past midnight. Let it do the arithmetic."),
    custom("No high waters, or just one", none_or_one,
           hint="With a count of 0 the list is empty; with 1, it holds only the first time."),
    custom("Your tests agree with the brief", passes_on(REFERENCE, "Moss's reference tides.py"),
           hint="One of your tests expects something the requirements don't say. Check its answer against the brief."),
    custom("Your tests notice a high_waters that leaves out the first time",
           catches(REFERENCE, "high_waters starts at the next tide", FIRST, "    high = next_high(first)\n"),
           hint="Test that the list starts with the time you gave it."),
    custom("Your tests notice a high_waters that stops one short",
           catches(REFERENCE, "high_waters returns one time too few", LOOP, "    while len(times) < count - 1:"),
           hint="Check the whole list: high_waters(\"06:42\", 3) has three times in it."),
    custom("Your tests still notice a can_cross that is wrong at the boundary",
           catches(REFERENCE, "can_cross uses > instead of >=", "    return round(depth - draught, 2) >= margin", "    return round(depth - draught, 2) > margin"),
           hint="Keep the boundary test from the last step."),
]
