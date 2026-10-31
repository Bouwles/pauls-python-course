def machine_plays(hands, inputs, expect):
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
            raise CheckFailed("The game should go like this.", expected=expect, actual=r.output)
    return check


TESTS = [
    custom("First to one", machine_plays(["scissors"], ["1", "rock"],
           "I chose scissors. You win.\nYou 1, me 0, draws 0.\nYou're off the coffee run."), visible=True),
    custom("Not a number, then five", machine_plays(["paper"], ["five", "0", "5", "rock", "rock", "rock", "rock", "rock"],
           "A whole number, please.\nA whole number, please.\n" + "I chose paper. I win.\n" * 5 +
           "You 0, me 5, draws 0.\nYou're on the coffee run.")),
]
