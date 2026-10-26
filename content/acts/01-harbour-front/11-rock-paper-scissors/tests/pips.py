def machine_plays(hands, inputs, expect):
    """Run the program with the machine's hands decided in advance."""
    def check(ctx):
        import random
        queue = list(hands)
        old = random.choice

        def scripted(options):
            if len(queue) > 1:
                return queue.pop(0)
            return queue[0]

        random.choice = scripted
        try:
            r = ctx.run_program(inputs=inputs)
        finally:
            random.choice = old
        if r.error is not None:
            raise CheckFailed(f"The program stopped with a {type(r.error).__name__}: {r.error}", expected=expect, actual=r.output)
        if norm_lines(r.output) != norm_lines(expect):
            raise CheckFailed(
                "With the machine set to play " + ", ".join(hands) + ", the game should go like this.",
                expected=expect, actual=r.output)
    return check


TESTS = [
    custom("Machine plays rock, paper, scissors", machine_plays(
        ["rock", "paper", "scissors"], ["paper", "paper", "paper"],
        "I chose rock.\nI chose paper.\nI chose scissors.\nYou 1, me 1, draws 1."), visible=True,
        hint="If the machine shows the same hand three times, it only picked once. Pick inside the loop."),
    custom("Machine plays scissors, scissors, rock", machine_plays(
        ["scissors", "scissors", "rock"], ["rock", "paper", "scissors"],
        "I chose scissors.\nI chose scissors.\nI chose rock.\nYou 1, me 2, draws 0.")),
]
