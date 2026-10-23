def game(number, guesses, expected):
    def check(ctx):
        import random
        old = random.randint
        random.randint = lambda low, high: number
        try:
            r = ctx.run_program(inputs=guesses)
        finally:
            random.randint = old
        if r.error is not None or norm_lines(r.output) != norm_lines(expected):
            raise CheckFailed(f"With the catch fixed at {number}, the replies are not right.", expected=expected, actual=r.output)
    return check


TESTS = [
    custom("Close below", game(10, ["8", "10"], "Too low.\nClose.\nGot it in 2."), visible=True),
    custom("Close above", game(10, ["12", "10"], "Too high.\nClose.\nGot it in 2."), visible=True),
    custom("Not close", game(10, ["3", "17", "10"], "Too low.\nToo high.\nGot it in 3.")),
    custom("Just too far", game(10, ["7", "13", "10"], "Too low.\nToo high.\nGot it in 3.")),
]
