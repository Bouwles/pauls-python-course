import types as _types


def load_tests(ctx, fines_source):
    module = ctx.module(files={"fines.py": fines_source})
    tests = [(name, value) for name, value in vars(module).items()
             if name.startswith("test_") and isinstance(value, _types.FunctionType)]
    if not tests:
        raise CheckFailed("There are no test_ functions in test_fines.py.")
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
        raise RuntimeError("content bug: the text to break is not in fines.py: " + old)
    return source.replace(old, new)


def passes_on_reference(ctx):
    failed = failures(load_tests(ctx, REFERENCE))
    if failed:
        name, problem = failed[0]
        raise CheckFailed(f"{name} fails on the real fines.py, which is right. Check the answer it expects against the rules.",
                          actual=f"{type(problem).__name__}: {problem}")


def catches(what, old, new):
    broken = mutant(REFERENCE, old, new)

    def check(ctx):
        if not failures(load_tests(ctx, broken)):
            raise CheckFailed(f"Every test passed on a fines.py where {what}. A test that can't fail isn't checking anything.")
    return check


REFERENCE = '"""Library fines, in pence. The library\'s rules, written down at last."""\n\nGRACE_DAYS = 2   # up to two days late is forgiven\nPER_DAY = 10     # pence for every day late, once it\'s past the grace\nCAP = 300        # nobody pays more than three pounds for one book\n\n\ndef fine(days_late, childrens=False):\n    """The fine in pence for one book. Children\'s books are half, after the cap."""\n    if days_late < 0:\n        raise ValueError("A book can\'t come back before it went out.")\n    if days_late <= GRACE_DAYS:\n        return 0\n    pence = min(days_late * PER_DAY, CAP)\n    if childrens:\n        pence = pence // 2\n    return pence\n'

GRACE = "    if days_late <= GRACE_DAYS:"
CHARGE = "    pence = min(days_late * PER_DAY, CAP)\n"
HALF = "        pence = pence // 2\n"
REFUSE = "        raise ValueError(\"A book can't come back before it went out.\")"
HALF_FIRST = (CHARGE + "    if childrens:\n" + HALF,
              "    pence = days_late * PER_DAY\n    if childrens:\n" + HALF + "    pence = min(pence, CAP)\n")


TESTS = [
    custom("Your tests pass on the real fines.py", passes_on_reference, visible=True,
           hint="Run test_fines.py and read the FAILED lines: each names the test and what went wrong."),
    custom("Your tests notice a fine with no cap", catches("there's no cap", CHARGE, "    pence = days_late * PER_DAY\n"),
           visible=True, hint="Test a book that's very late, say 90 days: the fine stops at 300p."),
    custom("Your tests notice the grace ending a day early",
           catches("two days late is fined", GRACE, "    if days_late < GRACE_DAYS:"),
           hint="Test the boundary: exactly 2 days late is still free."),
    custom("Your tests notice fines that only count the days after the grace",
           catches("3 days late is charged for 1 day, not 3", CHARGE, "    pence = min((days_late - GRACE_DAYS) * PER_DAY, CAP)\n"),
           hint="Test a book just past the grace: 3 days late is 30p, counting from the first day."),
    custom("Your tests notice children's books paying full price",
           catches("children's books aren't halved", HALF, "        pence = pence\n"),
           hint="Test a children's book, with childrens=True."),
    custom("Your tests notice the half worked out before the cap",
           catches("children's books are halved before the cap, not after", *HALF_FIRST),
           hint="Test a very late children's book: half of the 300p cap is 150p."),
    custom("Your tests notice a negative number of days let through",
           catches("fine(-1) gives back 0 instead of raising ValueError", REFUSE, "        return 0"),
           hint="Call fine(-1) inside try, return from except ValueError, and fail if it got past."),
]
