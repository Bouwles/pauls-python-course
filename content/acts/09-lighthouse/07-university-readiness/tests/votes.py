import random as _random


def whole_exhibition(ctx):
    # 50,000 names with three or four votes each, in shuffled order, then two
    # names that reach five. "Avocet" appears first and sorts first, but
    # "Shearwater" gets to five votes first.
    module = ctx.module()
    shuffle = _random.Random(87)
    ballots = [f"Print {number}" for number in range(50_000) for _ in range(3)]
    ballots += [f"Print {number}" for number in range(0, 50_000, 2)]
    shuffle.shuffle(ballots)
    ballots = ["Avocet"] * 4 + ["Shearwater"] * 4 + ballots + ["Shearwater", "Avocet"]
    got = module.winner(ballots)
    if got != "Shearwater":
        raise CheckFailed("Among 175,010 slips, Avocet and Shearwater both end on five votes. Shearwater reached five first.",
                          expected="Shearwater", actual=got)


def landslide(ctx):
    module = ctx.module()
    ballots = [f"Print {number}" for number in range(100_000)] + ["Cormorant"] * 2
    got = module.winner(ballots)
    if got != "Cormorant":
        raise CheckFailed("100,000 names with one vote each, then Cormorant with two.", expected="Cormorant", actual=got)


TESTS = [
    function("Most votes wins", call="winner", args=(["Gull", "Tern", "Gull"],), expect="Gull", visible=True),
    function("A tie: Gannet got there first", call="winner",
             args=(["Kittiwake", "Gannet", "Gannet", "Kittiwake", "Puffin"],), expect="Gannet", visible=True),
    function("No slips at all", call="winner", args=([],), expect=None,
             hint="With no ballots there's no winner: return None, without looking for a biggest count."),
    function("One slip", call="winner", args=(["Puffin"],), expect="Puffin"),
    function("Everyone on one vote", call="winner", args=(["Tern", "Auk", "Gull"],), expect="Tern",
             hint="Each name reaches one vote when it first appears, so the first slip got there first."),
    function("A tie: first to appear isn't first to get there", call="winner",
             args=(["Auk", "Tern", "Tern", "Auk"],), expect="Tern",
             hint="Auk appears first, but Tern reaches two votes on the third slip and Auk only on the fourth."),
    function("A tie: alphabetical order doesn't decide it", call="winner",
             args=(["Tern", "Auk", "Tern", "Auk"],), expect="Tern"),
    function("A late surge", call="winner", args=(["Auk", "Tern", "Auk", "Gull", "Gull", "Gull"],), expect="Gull"),
    function("Three draw level", call="winner",
             args=(["Gull", "Auk", "Tern", "Tern", "Auk", "Gull", "Auk", "Gull", "Tern"],), expect="Auk"),
    function("Capitals count", call="winner", args=(["gull", "Gull", "Tern", "Tern"],), expect="Tern"),
    custom("Everyone at the exhibition votes", whole_exhibition, timeout=6,
           hint="Count every slip once, keeping the leader as you go. Calling ballots.count() for each name reads the whole list 50,000 times."),
    custom("A hundred thousand names", landslide, timeout=6,
           hint="Working out the biggest count again after every slip is a loop inside a loop. Keep the leader as you go."),
]
