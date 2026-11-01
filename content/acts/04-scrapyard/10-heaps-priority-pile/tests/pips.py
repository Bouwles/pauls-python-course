def replay(module, events):
    """Run adds ("add", job, priority) and takes ("take",) and list what was taken."""
    pile = module.TaskScheduler()
    taken = []
    for event in events:
        if event[0] == "add":
            pile.add(event[1], event[2])
        else:
            taken.append(pile.take())
    return pile, taken


def expect_order(events, expected, message):
    def check(ctx):
        module = ctx.module()
        _pile, taken = replay(module, events)
        if taken != expected:
            raise CheckFailed(message, expected=expected, actual=taken)
    return check


TYRES_FIRST = [("add", "the tyre pressures", 3), ("add", "the chain tension", 3), ("add", "the loose steering bolt", 1),
               ("take",), ("take",), ("take",)]

URGENT_FIRST = [("add", "the cracked number plate", 4), ("add", "the brake pads", 2), ("add", "the fuel leak", 1),
                ("take",), ("take",), ("take",)]

THREE_TIED = [("add", "the throttle cable", 2), ("add", "the spark plug", 2), ("add", "a loose exhaust", 2),
              ("take",), ("take",), ("take",)]

MIXED = [("add", "the radiator cap", 3), ("add", "a bent pedal", 3), ("take",), ("add", "the axle bearing", 1),
         ("add", "a loose visor", 3), ("take",), ("take",), ("take",)]


def counts_waiting(ctx):
    module = ctx.module()
    pile, taken = replay(module, [("add", "a tyre", 2), ("add", "a chain", 5), ("add", "a seat", 2), ("take",)])
    if len(pile) != 2:
        raise CheckFailed("Three jobs added and one taken leaves two waiting.", expected=2, actual=len(pile))


def empty_pile(ctx):
    module = ctx.module()
    pile = module.TaskScheduler()
    try:
        got = pile.take()
    except IndexError:
        return
    raise CheckFailed("Taking from an empty pile should raise IndexError, as heappop does.", expected="IndexError", actual=repr(got))


def dictionaries(ctx):
    module = ctx.module()
    first = {"what": "front tyre", "for": "kart 7"}
    second = {"what": "rear tyre", "for": "kart 12"}
    events = [("add", first, 2), ("add", second, 2), ("take",), ("take",)]
    try:
        _pile, taken = replay(module, events)
    except TypeError as problem:
        raise CheckFailed(f"Two jobs with the same priority made Python compare the jobs themselves, and it can't compare dictionaries: {problem}")
    if taken != [first, second]:
        raise CheckFailed("Same priority, so the front tyre, which came in first, is done first.", expected=[first, second], actual=taken)


TESTS = [
    custom("The tyres were in first", expect_order(TYRES_FIRST, ["the loose steering bolt", "the tyre pressures", "the chain tension"],
                                                   "The steering bolt is most urgent. Then the tyres and the chain tie on 3, and the tyres came in first."),
           visible=True),
    custom("Most urgent first", expect_order(URGENT_FIRST, ["the fuel leak", "the brake pads", "the cracked number plate"],
                                             "Priority 1, then 2, then 4."), visible=True),
    custom("Three the same", expect_order(THREE_TIED, ["the throttle cable", "the spark plug", "a loose exhaust"],
                                          "Three jobs all at priority 2 are done in the order they came in."),
           hint="Ties go to whoever came in first, not whoever comes first in the alphabet. Count the arrivals."),
    custom("Taking while they come in", expect_order(MIXED, ["the radiator cap", "the axle bearing", "a bent pedal", "a loose visor"],
                                                     "The radiator cap, then the axle bearing the moment it arrives, then the other two 3s in the order they came.")),
    custom("Counting what's waiting", counts_waiting),
    custom("An empty pile", empty_pile),
    custom("Jobs written as dictionaries", dictionaries,
           hint="With an arrival number between the priority and the job, two tuples never get as far as comparing the jobs."),
]
