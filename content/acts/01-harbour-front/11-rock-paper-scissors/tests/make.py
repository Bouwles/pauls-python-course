def machine_plays(hands, inputs, expect):
    """Run the whole game with the machine's hands decided in advance.
    After the list runs out, the machine keeps playing the last hand."""
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
        if isinstance(r.error, EOFError):
            raise CheckFailed("The game asked for another hand when it should have finished. It ends at three wins, or on quit.",
                              expected=expect, actual=r.output)
        if r.error is not None:
            raise CheckFailed(f"The program stopped with a {type(r.error).__name__}: {r.error}", expected=expect, actual=r.output)
        if norm_lines(r.output) != norm_lines(expect):
            raise CheckFailed(
                "With the machine set to play " + ", ".join(hands) + ", the game should go like this.",
                expected=expect, actual=r.output)
    return check


OFF = "You're off the glasses."
ON = "You're on the glasses."

TESTS = [
    function("winner(\"rock\", \"scissors\")", call="winner", args=("rock", "scissors"), expect="you", visible=True),
    custom("Three straight wins", machine_plays(
        ["scissors", "rock", "paper"], ["rock", "paper", "scissors"],
        "I chose scissors. You win.\nI chose rock. You win.\nI chose paper. You win.\nYou 3, me 0, draws 0.\n" + OFF),
        visible=True),
    function("winner(\"scissors\", \"rock\")", call="winner", args=("scissors", "rock"), expect="me"),
    function("winner(\"paper\", \"paper\")", call="winner", args=("paper", "paper"), expect="draw",
             hint="The same hand on both sides is a draw, whatever the hand."),
    function("winner(\"scissors\", \"paper\")", call="winner", args=("scissors", "paper"), expect="you"),
    function("winner(\"paper\", \"scissors\")", call="winner", args=("paper", "scissors"), expect="me"),
    custom("The machine wins", machine_plays(
        ["paper"], ["rock", "rock", "rock"],
        "I chose paper. I win.\nI chose paper. I win.\nI chose paper. I win.\nYou 0, me 3, draws 0.\n" + ON),
        hint="When the machine gets to three, the game ends and you're on the glasses."),
    custom("Capitals and spaces", machine_plays(
        ["rock"], [" PAPER ", "Paper", "paper"],
        "I chose rock. You win.\nI chose rock. You win.\nI chose rock. You win.\nYou 3, me 0, draws 0.\n" + OFF),
        hint="Strip the spaces and lower the capitals before you check what was typed."),
    custom("Draws don't count towards three", machine_plays(
        ["rock"], ["rock", "rock", "paper", "rock", "paper", "paper"],
        "I chose rock. A draw.\nI chose rock. A draw.\nI chose rock. You win.\nI chose rock. A draw.\n"
        "I chose rock. You win.\nI chose rock. You win.\nYou 3, me 0, draws 3.\n" + OFF),
        hint="Only wins count towards three. Keep going while neither side has three wins."),
    custom("A fresh hand every round", machine_plays(
        ["rock", "paper", "scissors"], ["paper", "paper", "paper", "quit"],
        "I chose rock. You win.\nI chose paper. A draw.\nI chose scissors. I win.\nYou 1, me 1, draws 1."),
        hint="Pick the machine's hand inside the loop, so it changes every round."),
    custom("A close game", machine_plays(
        ["rock", "scissors", "paper", "rock", "scissors"], ["paper", "paper", "scissors", "scissors", "rock"],
        "I chose rock. You win.\nI chose scissors. I win.\nI chose paper. You win.\nI chose rock. I win.\n"
        "I chose scissors. You win.\nYou 3, me 2, draws 0.\n" + OFF)),
    custom("Not a hand", machine_plays(
        ["rock"], ["lizard", "", "stone", " QUIT "],
        "Rock, paper or scissors. Nothing else.\nRock, paper or scissors. Nothing else.\n"
        "Rock, paper or scissors. Nothing else.\nYou 0, me 0, draws 0."),
        hint="Anything that isn't rock, paper or scissors is refused and doesn't count. quit is tidied like any answer."),
    custom("Quit straight away", machine_plays(["rock"], ["quit"], "You 0, me 0, draws 0."),
           hint="Quitting prints the score and nothing else: nobody got to three."),
    structure("Picks with random.choice", calls=["choice"],
              message="Pick the machine's hand with random.choice(HANDS). The checks depend on it."),
]
