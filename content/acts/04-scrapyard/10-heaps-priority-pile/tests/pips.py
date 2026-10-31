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


HEADPHONES_FIRST = [("add", "Riya's headphones", 3), ("add", "Paul's desk lamp", 3), ("add", "the arcade cabinet", 1),
               ("take",), ("take",), ("take",)]

URGENT_FIRST = [("add", "the Studio kettle", 4), ("add", "Neil's keyboard", 2), ("add", "Yahya's stopwatch", 1),
                ("take",), ("take",), ("take",)]

THREE_TIED = [("add", "the soldering iron", 2), ("add", "the projector", 2), ("add", "an extension lead", 2),
              ("take",), ("take",), ("take",)]

MIXED = [("add", "the printer", 3), ("add", "a bike light", 3), ("take",), ("add", "the arcade cabinet", 1),
         ("add", "a desk fan", 3), ("take",), ("take",), ("take",)]


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
    first = {"what": "joystick", "for": "Yahya"}
    second = {"what": "kettle lid", "for": "Neil"}
    events = [("add", first, 2), ("add", second, 2), ("take",), ("take",)]
    try:
        _pile, taken = replay(module, events)
    except TypeError as problem:
        raise CheckFailed(f"Two repairs with the same priority made Python compare the repairs themselves, and it can't compare dictionaries: {problem}")
    if taken != [first, second]:
        raise CheckFailed("Same priority, so the joystick, which came in first, is mended first.", expected=[first, second], actual=taken)


TESTS = [
    custom("The headphones were in first", expect_order(HEADPHONES_FIRST, ["the arcade cabinet", "Riya's headphones", "Paul's desk lamp"],
                                                        "The cabinet is most urgent. Then the headphones and the lamp tie on 3, and the headphones came in first."),
           visible=True),
    custom("Most urgent first", expect_order(URGENT_FIRST, ["Yahya's stopwatch", "Neil's keyboard", "the Studio kettle"],
                                             "Priority 1, then 2, then 4."), visible=True),
    custom("Three the same", expect_order(THREE_TIED, ["the soldering iron", "the projector", "an extension lead"],
                                          "Three repairs all at priority 2 are mended in the order they came in."),
           hint="Ties go to whoever came in first, not whoever comes first in the alphabet. Count the arrivals."),
    custom("Taking while they come in", expect_order(MIXED, ["the printer", "the arcade cabinet", "a bike light", "a desk fan"],
                                                     "The printer, then the cabinet the moment it arrives, then the other two 3s in the order they came.")),
    custom("Counting what's waiting", counts_waiting),
    custom("An empty pile", empty_pile),
    custom("Repairs written as dictionaries", dictionaries,
           hint="With an arrival number between the priority and the repair, two tuples never get as far as comparing the repairs."),
]
