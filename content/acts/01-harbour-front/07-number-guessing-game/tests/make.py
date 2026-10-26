def game(number, guesses, expected):
    """Fix the secret at `number`, play `guesses`, and compare the replies."""
    def check(ctx):
        import random
        old = random.randint
        random.randint = lambda low, high: number
        try:
            r = ctx.run_program(inputs=guesses)
        finally:
            random.randint = old
        if isinstance(r.error, EOFError):
            raise CheckFailed(f"The game asked for another guess after these {len(guesses)}. It should have stopped by then.",
                              expected=expected, actual=r.output)
        if r.error is not None:
            raise CheckFailed(f"The game crashed: {type(r.error).__name__}: {r.error}", expected=expected, actual=r.output)
        if norm_lines(r.output) != norm_lines(expected):
            raise CheckFailed(f"With the number fixed at {number}, the replies are not right.", expected=expected, actual=r.output)
    return check


def picks_once(ctx):
    import random
    old = random.randint
    calls = []

    def fake(low, high):
        calls.append((low, high))
        return 7

    random.randint = fake
    try:
        ctx.run_program(inputs=["7"])
    finally:
        random.randint = old
    if calls != [(1, 100)]:
        made = ", ".join(f"randint{c}" for c in calls) or "no call to random.randint"
        raise CheckFailed("Pick the number once, before the guessing starts, with random.randint(1, 100).",
                          expected="randint(1, 100)", actual=made)


TESTS = [
    custom("Number 37: guesses 50, 25, 37", game(37, ["50", "25", "37"], "Too high.\nToo low.\nGot it in 3."), visible=True),
    custom("Number 80: gives up after two", game(80, ["50", "75", "q"], "Too low.\nToo low.\nIt was 80."), visible=True),
    custom("Number 64: right first time", game(64, ["64"], "Got it in 1."),
           hint="Once the guess is right, stop asking. break leaves the loop."),
    custom("Number 42: gives up straight away", game(42, ["q"], "It was 42."),
           hint="Check for q before int(). int(\"q\") is a ValueError."),
    custom("A guess of 150 doesn't count", game(10, ["150", "5", "10"], "Between 1 and 100.\nToo low.\nGot it in 2."),
           hint="150 gets Between 1 and 100. and isn't counted. continue, before the counting line, skips it."),
    custom("A guess of 0 doesn't count", game(1, ["0", "1"], "Between 1 and 100.\nGot it in 1."),
           hint="0 is below 1, so it's turned away too, and not counted."),
    custom("100 is allowed", game(100, ["99", "100"], "Too low.\nGot it in 2."),
           hint="1 and 100 are both fair guesses. Check the < and > in the range test."),
    custom("Number 63: seven guesses", game(63, ["50", "75", "62", "69", "65", "64", "63"],
                                            "Too low.\nToo high.\nToo low.\nToo high.\nToo high.\nToo high.\nGot it in 7.")),
    custom("Picks from 1 to 100, once", picks_once,
           hint="Call random.randint(1, 100) once, above the loop. Inside the loop it would pick a new number every guess."),
]
