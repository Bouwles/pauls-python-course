def replay(module, events):
    """Run adds ("add", repair, priority) and takes ("take",) and list what was taken."""
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


VANCE_FIRST = [("add", "Mrs Vance's trolley", 3), ("add", "Mr Ashby's ladder", 3), ("add", "the ferry winch", 1),
               ("take",), ("take",), ("take",)]

URGENT_FIRST = [("add", "the crab club's bell", 4), ("add", "Bea's oven door", 2), ("add", "Tom's lamp bracket", 1),
                ("take",), ("take",), ("take",)]

THREE_TIED = [("add", "the weather vane", 2), ("add", "the post bag", 2), ("add", "an anchor chain", 2),
              ("take",), ("take",), ("take",)]

MIXED = [("add", "the town hall clock", 3), ("add", "a bike chain", 3), ("take",), ("add", "the ferry winch", 1),
         ("add", "a library ladder", 3), ("take",), ("take",), ("take",)]


def counts_waiting(ctx):
    module = ctx.module()
    pile, taken = replay(module, [("add", "a kettle", 2), ("add", "a hinge", 5), ("add", "a gate", 2), ("take",)])
    if len(pile) != 2:
        raise CheckFailed("Three repairs added and one taken leaves two waiting.", expected=2, actual=len(pile))


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
    first = {"what": "rudder", "for": "Captain Ferro"}
    second = {"what": "rolling pin", "for": "Bea"}
    events = [("add", first, 2), ("add", second, 2), ("take",), ("take",)]
    try:
        _pile, taken = replay(module, events)
    except TypeError as problem:
        raise CheckFailed(f"Two repairs with the same priority made Python compare the repairs themselves, and it can't compare dictionaries: {problem}")
    if taken != [first, second]:
        raise CheckFailed("Same priority, so the rudder, which came in first, is mended first.", expected=[first, second], actual=taken)


TESTS = [
    custom("Mrs Vance was in first", expect_order(VANCE_FIRST, ["the ferry winch", "Mrs Vance's trolley", "Mr Ashby's ladder"],
                                                  "The winch is most urgent. Then Mrs Vance and Mr Ashby tie on 3, and she came in first."),
           visible=True),
    custom("Most urgent first", expect_order(URGENT_FIRST, ["Tom's lamp bracket", "Bea's oven door", "the crab club's bell"],
                                             "Priority 1, then 2, then 4."), visible=True),
    custom("Three the same", expect_order(THREE_TIED, ["the weather vane", "the post bag", "an anchor chain"],
                                          "Three repairs all at priority 2 are mended in the order they came in."),
           hint="Ties go to whoever came in first, not whoever comes first in the alphabet. Count the arrivals."),
    custom("Taking while they come in", expect_order(MIXED, ["the town hall clock", "the ferry winch", "a bike chain", "a library ladder"],
                                                     "The clock, then the winch the moment it arrives, then the other two 3s in the order they came.")),
    custom("Counting what's waiting", counts_waiting),
    custom("An empty pile", empty_pile),
    custom("Repairs written as dictionaries", dictionaries,
           hint="With an arrival number between the priority and the repair, two tuples never get as far as comparing the repairs."),
]
