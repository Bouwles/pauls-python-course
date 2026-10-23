def game(number, guesses, expected):
    """Fix the catch at `number`, play `guesses`, and compare the replies."""
    def check(ctx):
        import random
        old = random.randint
        random.randint = lambda low, high: number
        try:
            r = ctx.run_program(inputs=guesses)
        finally:
            random.randint = old
        if isinstance(r.error, EOFError):
            raise CheckFailed(f"The game asked for more than these {len(guesses)} guesses. It should have stopped by then.",
                              expected=expected, actual=r.output)
        if r.error is not None:
            raise CheckFailed(f"The game crashed: {type(r.error).__name__}: {r.error}", expected=expected, actual=r.output)
        if norm_lines(r.output) != norm_lines(expected):
            raise CheckFailed(f"With the catch fixed at {number}, the replies are not right.", expected=expected, actual=r.output)
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
    if calls != [(1, 20)]:
        made = ", ".join(f"randint{c}" for c in calls) or "no call to random.randint"
        raise CheckFailed("Pick the catch once, before the guessing starts, with random.randint(1, 20).",
                          expected="randint(1, 20)", actual=made)


TESTS = [
    custom("Catch of 7: guesses 10, 5, 7", game(7, ["10", "5", "7"], "Too high.\nToo low.\nGot it in 3."), visible=True),
    custom("Catch of 15: five misses", game(15, ["10", "18", "12", "16", "14"],
                                            "Too low.\nToo high.\nToo low.\nToo high.\nToo low.\nOut of guesses. It was 15."),
           visible=True),
    custom("Catch of 4: right first time", game(4, ["4"], "Got it in 1."),
           hint="Once the guess is right, stop asking. break leaves the loop."),
    custom("Catch of 19: right on the fifth guess", game(19, ["1", "5", "10", "15", "19"],
                                                         "Too low.\nToo low.\nToo low.\nToo low.\nGot it in 5."),
           hint="A win on the last guess is still a win. It shouldn't say Out of guesses."),
    custom("A guess of 25", game(7, ["25", "10", "7"], "Between 1 and 20.\nToo high.\nGot it in 3."),
           hint="25 gets Between 1 and 20. and nothing else, and it still uses up a guess."),
    custom("A guess of 0", game(2, ["0", "1", "2"], "Between 1 and 20.\nToo low.\nGot it in 3."),
           hint="0 is below 1, so it's a daft guess too."),
    custom("Five daft guesses", game(9, ["0", "21", "30", "-4", "100"], "\n".join(["Between 1 and 20."] * 5) + "\nOut of guesses. It was 9."),
           hint="Daft guesses still use up a go. After five of them the game is over."),
    custom("Picks from 1 to 20, once", picks_once,
           hint="Call random.randint(1, 20) once, above the loop. Inside the loop it would pick a new number every guess."),
]
