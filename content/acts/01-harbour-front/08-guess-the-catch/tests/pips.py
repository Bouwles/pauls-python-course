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
            raise CheckFailed(f"The game asked for another guess after the right one. It should stop at {number}.",
                              expected=expected, actual=r.output)
        if r.error is not None:
            raise CheckFailed(f"The game crashed: {type(r.error).__name__}: {r.error}", expected=expected, actual=r.output)
        if norm_lines(r.output) != norm_lines(expected):
            raise CheckFailed(f"With the catch fixed at {number}, the replies are not right.", expected=expected, actual=r.output)
    return check


TESTS = [
    custom("Catch of 7: guesses 10, 5, 7", game(7, ["10", "5", "7"], "Too high.\nToo low.\nGot it in 3."), visible=True,
           hint="After the right guess the game should stop asking. break leaves the loop."),
    custom("Right first time", game(12, ["12"], "Got it in 1.")),
    custom("Right on the last guess", game(15, ["1", "2", "3", "4", "15"],
                                           "Too low.\nToo low.\nToo low.\nToo low.\nGot it in 5.")),
]
