import copy as _copy
import heapq as _heapq
import random as _random

MINUTES = {
    "scrapyard": {"workshop": 8, "tailor": 4, "records-office": 7},
    "workshop": {"scrapyard": 8, "bakery": 2, "tailor": 3},
    "bakery": {"workshop": 2, "post-office": 2, "library": 3},
    "post-office": {"bakery": 2, "pub": 3, "town-hall": 2, "ferry": 4},
    "pub": {"post-office": 3, "harbour-office": 2, "greengrocer": 3},
    "harbour-office": {"pub": 2, "ferry": 3, "crab-club": 4, "lighthouse": 9},
    "ferry": {"post-office": 4, "harbour-office": 3},
    "lighthouse": {"harbour-office": 9},
    "tailor": {"scrapyard": 4, "workshop": 3, "library": 2},
    "library": {"tailor": 2, "bakery": 3, "town-hall": 2},
    "town-hall": {"library": 2, "post-office": 2, "greengrocer": 3, "weather-station": 8},
    "greengrocer": {"town-hall": 3, "pub": 3, "bike-shed": 2},
    "bike-shed": {"greengrocer": 2, "crab-club": 3, "observatory": 10},
    "crab-club": {"bike-shed": 3, "harbour-office": 4},
    "records-office": {"scrapyard": 7, "weather-station": 3},
    "weather-station": {"records-office": 3, "town-hall": 8, "observatory": 6},
    "observatory": {"weather-station": 6, "bike-shed": 10},
}

TRIANGLE = {"quay": {"chapel": 10, "net-loft": 3}, "net-loft": {"quay": 3, "chapel": 4}, "chapel": {"quay": 10, "net-loft": 4}}

LONG_WAY = {"gate": {"shed": 1, "boathouse": 10}, "shed": {"yard": 1}, "yard": {"slipway": 1}, "slipway": {"boathouse": 1}}

# The slipway has no dictionary of its own: a dead end. One-way roads throughout.
ONE_WAY = {"quay": {"fish-market": 2, "slipway": 9}, "fish-market": {"chapel": 3}, "chapel": {"quay": 1}}

FREE_ROAD = {"pub": {"cellar": 0, "yard": 5}, "cellar": {"yard": 2}, "yard": {}}

SQUARE = {"pub": {"bakery": 2, "tailor": 3}, "bakery": {"pub": 2, "library": 3}, "tailor": {"pub": 3, "library": 2}, "library": {"bakery": 3, "tailor": 2}}

FLOODED = {place: {n: m for n, m in near.items() if n != "lighthouse"} for place, near in MINUTES.items()}
FLOODED["lighthouse"] = {}


class TooMany(Exception):
    pass


class Tally:
    def __init__(self, limit):
        self.count = 0
        self.limit = limit

    def tick(self):
        self.count += 1
        if self.count > self.limit:
            raise TooMany()


class Neighbours(dict):
    """One place's roads, counting every time someone goes through them."""

    def __init__(self, roads, tally):
        super().__init__(roads)
        self.tally = tally

    def items(self):
        self.tally.tick()
        return super().items()

    def keys(self):
        self.tally.tick()
        return super().keys()

    def values(self):
        self.tally.tick()
        return super().values()

    def __iter__(self):
        self.tally.tick()
        return super().__iter__()


def counting(roads, limit):
    tally = Tally(limit)
    return {place: Neighbours(near, tally) for place, near in roads.items()}, tally


def quiet(module):
    """Drawings are for Run. The checks switch them off."""
    for name in ("show_graph", "show_grid"):
        if hasattr(module, name):
            setattr(module, name, lambda *args, **kwargs: None)
    return module


def weighted_grid(size, seed):
    rng = _random.Random(seed)
    roads = {f"{row},{col}": {} for row in range(size) for col in range(size)}
    for row in range(size):
        for col in range(size):
            for other_row, other_col in ((row + 1, col), (row, col + 1)):
                if other_row < size and other_col < size:
                    minutes = rng.randint(1, 9)
                    roads[f"{row},{col}"][f"{other_row},{other_col}"] = minutes
                    roads[f"{other_row},{other_col}"][f"{row},{col}"] = minutes
    return roads


def true_best(roads, start):
    best = {start: 0}
    waiting = [(0, start)]
    while waiting:
        minutes, place = _heapq.heappop(waiting)
        if minutes > best[place]:
            continue
        for neighbour, road in roads.get(place, {}).items():
            if neighbour not in best or minutes + road < best[neighbour]:
                best[neighbour] = minutes + road
                _heapq.heappush(waiting, (minutes + road, neighbour))
    return best


def check_route(roads, start, goal, got):
    best = true_best(roads, start)
    if goal not in best:
        if got is not None:
            raise CheckFailed(f"There's no way from {start} to {goal}, so quickest_route should give back None.", expected="None", actual=repr(got))
        return
    if not isinstance(got, tuple) or len(got) != 2:
        raise CheckFailed("quickest_route should give back a pair, (minutes, route).", actual=repr(got))
    minutes, route = got
    if minutes != best[goal]:
        raise CheckFailed(f"The quickest from {start} to {goal} takes {best[goal]} minutes.", expected=best[goal], actual=minutes)
    if not isinstance(route, list) or route[:1] != [start] or route[-1:] != [goal]:
        raise CheckFailed(f"The route should be a list from {start} to {goal}.", actual=repr(route))
    total = 0
    for here, there in zip(route, route[1:]):
        if there not in roads.get(here, {}):
            raise CheckFailed(f"There's no road from {here} to {there}.", actual=route if len(route) < 12 else f"{len(route)} places")
        total += roads[here][there]
    if total != minutes:
        raise CheckFailed(f"The minutes say {minutes}, but that route takes {total}. The route should be the one the minutes are for.",
                          expected=minutes, actual=total)


def quickest(roads, start, goal):
    def check(ctx):
        module = quiet(ctx.module())
        given = _copy.deepcopy(roads)
        check_route(roads, start, goal, module.quickest_route(given, start, goal))
        if given != roads:
            raise CheckFailed("quickest_route should leave the map as it found it.")
    return check


def times(roads, start, message):
    def check(ctx):
        module = quiet(ctx.module())
        given = _copy.deepcopy(roads)
        got = module.quickest_times(given, start)
        expected = true_best(roads, start)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
        if given != roads:
            raise CheckFailed("quickest_times should leave the map as it found it.")
    return check


def no_road(ctx):
    module = quiet(ctx.module())
    try:
        got = module.route_minutes(MINUTES, ["scrapyard", "bakery", "post-office"])
    except ValueError as problem:
        message = str(problem)
        if "scrapyard" not in message or "bakery" not in message:
            raise CheckFailed("The ValueError should name both places, so Nell knows which road is missing.", expected="scrapyard and bakery", actual=message)
        return
    raise CheckFailed("There's no road from the scrapyard to the bakery, so route_minutes should raise ValueError.", expected="ValueError", actual=repr(got))


def against_one_way(ctx):
    module = quiet(ctx.module())
    try:
        got = module.route_minutes(ONE_WAY, ["fish-market", "quay"])
    except ValueError:
        return
    raise CheckFailed("The road from the quay to the fish market is one way, so going back is no road at all.", expected="ValueError", actual=repr(got))


def big_times(ctx):
    module = quiet(ctx.module())
    plain = weighted_grid(30, 11)
    roads, tally = counting(plain, 1000)
    try:
        got = module.quickest_times(roads, "0,0")
    except TooMany:
        raise CheckFailed("Timing a town of 900 places went through places' roads more than 1,000 times. Settle each place once, and skip old entries when they come off the heap.")
    expected = true_best(plain, "0,0")
    if got != expected:
        wrong = [place for place in expected if got.get(place) != expected[place]] if isinstance(got, dict) else []
        raise CheckFailed("Every one of the 900 places, and its fewest minutes from 0,0.",
                          expected=f"{len(expected)} places", actual=f"{len(got)} places, {len(wrong)} wrong" if isinstance(got, dict) else repr(got))


def big_route(ctx):
    module = quiet(ctx.module())
    plain = weighted_grid(30, 23)
    roads, tally = counting(plain, 1000)
    try:
        got = module.quickest_route(roads, "0,0", "29,29")
    except TooMany:
        raise CheckFailed("Crossing a town of 900 places went through places' roads more than 1,000 times. Settle each place once, and skip old entries when they come off the heap.")
    check_route(plain, "0,0", "29,29", got)


TESTS = [
    function("Fewest roads to the ferry, in minutes", call="route_minutes",
             args=(MINUTES, ["scrapyard", "workshop", "bakery", "post-office", "ferry"]), expect=16, visible=True),
    function("Quickest to the ferry", call="quickest_route", args=(MINUTES, "scrapyard", "ferry"),
             expect=(14, ["scrapyard", "tailor", "library", "town-hall", "post-office", "ferry"]), visible=True),
    function("A route of one place", call="route_minutes", args=(MINUTES, ["pub"]), expect=0),
    function("No route at all", call="route_minutes", args=(MINUTES, []), expect=0),
    function("Up the hill and back", call="route_minutes", args=(MINUTES, ["town-hall", "weather-station", "town-hall"]), expect=16),
    custom("A road that isn't there", no_road,
           hint="Check the next place is in this place's dictionary before you add its minutes, and raise ValueError naming both if it isn't."),
    custom("Against a one-way road", against_one_way),
    custom("Every time from the yard", times(MINUTES, "scrapyard", "The fewest minutes from the scrapyard to every place in town.")),
    custom("Every time from the lighthouse", times(MINUTES, "lighthouse", "From the lighthouse, everything starts with nine minutes to the harbour office.")),
    custom("Times round the triangle", times(TRIANGLE, "quay", "The chapel is 7 minutes away, by the net loft, not 10."),
           hint="A place's minutes can still go down after you've first seen it. Only a place that's come off the heap is settled."),
    custom("Times the long way round", times(LONG_WAY, "gate", "Four one-minute roads to the boathouse beat the ten-minute one.")),
    custom("Times with one-way roads and a dead end", times(ONE_WAY, "quay", "From the quay: the fish market, the chapel, and the slipway, which has no roads out."),
           hint="A place with no dictionary of its own has no roads out. roads.get(place, {}) treats it as a dead end."),
    custom("A road that takes no time", times(FREE_ROAD, "pub", "The cellar is 0 minutes away, and the yard 2, through the cellar.")),
    custom("Nobody reaches the lighthouse", times(FLOODED, "workshop", "With the causeway flooded, the lighthouse can't be reached, so it isn't in the dictionary.")),
    custom("Times in a town of 900 places", big_times),
    function("Already there", call="quickest_route", args=(MINUTES, "pub", "pub"), expect=(0, ["pub"])),
    function("The causeway's flooded", call="quickest_route", args=(FLOODED, "workshop", "lighthouse"), expect=None,
             hint="When nothing is left waiting and the goal was never reached, give back None."),
    custom("The lighthouse from the observatory", quickest(MINUTES, "observatory", "lighthouse")),
    custom("Round the triangle", quickest(TRIANGLE, "quay", "chapel"),
           hint="When a quicker way to a place turns up, change its minutes and where it came from, and put it back in waiting."),
    custom("The long way round", quickest(LONG_WAY, "gate", "boathouse")),
    custom("Two routes, equally quick", quickest(SQUARE, "pub", "library")),
    custom("Down one-way roads", quickest(ONE_WAY, "fish-market", "slipway")),
    function("Up a one-way road", call="quickest_route", args=(ONE_WAY, "slipway", "quay"), expect=None),
    custom("Across a town of 900 places", big_route),
    structure("Uses heapq", calls=["heappop"], message="Keep the waiting places in a heap, with heapq.heappush and heapq.heappop."),
]
