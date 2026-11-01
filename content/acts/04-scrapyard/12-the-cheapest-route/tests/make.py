import copy as _copy
import heapq as _heapq
import random as _random

MINUTES = {
    "campsite": {"main-gate": 8, "food-court": 4, "car-park": 7},
    "main-gate": {"campsite": 8, "fan-zone": 2, "food-court": 3},
    "fan-zone": {"main-gate": 2, "paddock": 2, "merch-stand": 3},
    "paddock": {"fan-zone": 2, "big-screen": 3, "grandstand": 2, "hairpin": 4},
    "big-screen": {"paddock": 3, "footbridge": 2, "chicane": 3},
    "footbridge": {"big-screen": 2, "hairpin": 3, "tunnel": 4, "viewing-bank": 9},
    "hairpin": {"paddock": 4, "footbridge": 3},
    "viewing-bank": {"footbridge": 9},
    "food-court": {"campsite": 4, "main-gate": 3, "merch-stand": 2},
    "merch-stand": {"food-court": 2, "fan-zone": 3, "grandstand": 2},
    "grandstand": {"merch-stand": 2, "paddock": 2, "chicane": 3, "media-centre": 8},
    "chicane": {"grandstand": 3, "big-screen": 3, "kart-track": 2},
    "kart-track": {"chicane": 2, "tunnel": 3, "back-straight": 10},
    "tunnel": {"kart-track": 3, "footbridge": 4},
    "car-park": {"campsite": 7, "media-centre": 3},
    "media-centre": {"car-park": 3, "grandstand": 8, "back-straight": 6},
    "back-straight": {"media-centre": 6, "kart-track": 10},
}

TRIANGLE = {"garage": {"pit-wall": 10, "timing-room": 3}, "timing-room": {"garage": 3, "pit-wall": 4}, "pit-wall": {"garage": 10, "timing-room": 4}}

LONG_WAY = {"tent": {"shower-block": 1, "pit-lane": 10}, "shower-block": {"crossing": 1}, "crossing": {"service-road": 1}, "service-road": {"pit-lane": 1}}

# Scrutineering has no dictionary of its own: a dead end. One-way roads throughout.
ONE_WAY = {"garage": {"food-van": 2, "scrutineering": 9}, "food-van": {"pit-wall": 3}, "pit-wall": {"garage": 1}}

FREE_ROAD = {"fan-zone": {"lift": 0, "roof": 5}, "lift": {"roof": 2}, "roof": {}}

SQUARE = {"big-screen": {"fan-zone": 2, "food-court": 3}, "fan-zone": {"big-screen": 2, "merch-stand": 3}, "food-court": {"big-screen": 3, "merch-stand": 2}, "merch-stand": {"fan-zone": 3, "food-court": 2}}

CLOSED = {place: {n: m for n, m in near.items() if n != "viewing-bank"} for place, near in MINUTES.items()}
CLOSED["viewing-bank"] = {}


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
        got = module.route_minutes(MINUTES, ["campsite", "fan-zone", "paddock"])
    except ValueError as problem:
        message = str(problem)
        if "campsite" not in message or "fan-zone" not in message:
            raise CheckFailed("The ValueError should name both places, so Neil knows which road is missing.", expected="campsite and fan-zone", actual=message)
        return
    raise CheckFailed("There's no road from the campsite to the fan zone, so route_minutes should raise ValueError.", expected="ValueError", actual=repr(got))


def against_one_way(ctx):
    module = quiet(ctx.module())
    try:
        got = module.route_minutes(ONE_WAY, ["food-van", "garage"])
    except ValueError:
        return
    raise CheckFailed("The road from the garage to the food van is one way, so going back is no road at all.", expected="ValueError", actual=repr(got))


def big_times(ctx):
    module = quiet(ctx.module())
    plain = weighted_grid(30, 11)
    roads, tally = counting(plain, 1000)
    try:
        got = module.quickest_times(roads, "0,0")
    except TooMany:
        raise CheckFailed("Timing a map of 900 places went through places' roads more than 1,000 times. Settle each place once, and skip old entries when they come off the heap.")
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
        raise CheckFailed("Crossing a map of 900 places went through places' roads more than 1,000 times. Settle each place once, and skip old entries when they come off the heap.")
    check_route(plain, "0,0", "29,29", got)


TESTS = [
    function("Fewest roads to the hairpin, in minutes", call="route_minutes",
             args=(MINUTES, ["campsite", "main-gate", "fan-zone", "paddock", "hairpin"]), expect=16, visible=True),
    function("Quickest to the hairpin", call="quickest_route", args=(MINUTES, "campsite", "hairpin"),
             expect=(14, ["campsite", "food-court", "merch-stand", "grandstand", "paddock", "hairpin"]), visible=True),
    function("A route of one place", call="route_minutes", args=(MINUTES, ["big-screen"]), expect=0),
    function("No route at all", call="route_minutes", args=(MINUTES, []), expect=0),
    function("To the media centre and back", call="route_minutes", args=(MINUTES, ["grandstand", "media-centre", "grandstand"]), expect=16),
    custom("A road that isn't there", no_road,
           hint="Check the next place is in this place's dictionary before you add its minutes, and raise ValueError naming both if it isn't."),
    custom("Against a one-way road", against_one_way),
    custom("Every time from the campsite", times(MINUTES, "campsite", "The fewest minutes from the campsite to every place round the circuit.")),
    custom("Every time from the viewing bank", times(MINUTES, "viewing-bank", "From the viewing bank, everything starts with nine minutes to the footbridge.")),
    custom("Times round the triangle", times(TRIANGLE, "garage", "The pit wall is 7 minutes away, by the timing room, not 10."),
           hint="A place's minutes can still go down after you've first seen it. Only a place that's come off the heap is settled."),
    custom("Times the long way round", times(LONG_WAY, "tent", "Four one-minute roads to the pit lane beat the ten-minute one.")),
    custom("Times with one-way roads and a dead end", times(ONE_WAY, "garage", "From the garage: the food van, the pit wall, and scrutineering, which has no roads out."),
           hint="A place with no dictionary of its own has no roads out. roads.get(place, {}) treats it as a dead end."),
    custom("A road that takes no time", times(FREE_ROAD, "fan-zone", "The lift is 0 minutes away, and the roof 2, through the lift.")),
    custom("Nobody reaches the viewing bank", times(CLOSED, "main-gate", "With its road closed, the viewing bank can't be reached, so it isn't in the dictionary.")),
    custom("Times on a map of 900 places", big_times),
    function("Already there", call="quickest_route", args=(MINUTES, "big-screen", "big-screen"), expect=(0, ["big-screen"])),
    function("The road to the viewing bank is closed", call="quickest_route", args=(CLOSED, "main-gate", "viewing-bank"), expect=None,
             hint="When nothing is left waiting and the goal was never reached, give back None."),
    custom("The viewing bank from the back straight", quickest(MINUTES, "back-straight", "viewing-bank")),
    custom("Round the triangle", quickest(TRIANGLE, "garage", "pit-wall"),
           hint="When a quicker way to a place turns up, change its minutes and where it came from, and put it back in waiting."),
    custom("The long way round", quickest(LONG_WAY, "tent", "pit-lane")),
    custom("Two routes, equally quick", quickest(SQUARE, "big-screen", "merch-stand")),
    custom("Down one-way roads", quickest(ONE_WAY, "food-van", "scrutineering")),
    function("Up a one-way road", call="quickest_route", args=(ONE_WAY, "scrutineering", "garage"), expect=None),
    custom("Across a map of 900 places", big_route),
    structure("Uses heapq", calls=["heappop"], message="Keep the waiting places in a heap, with heapq.heappush and heapq.heappop."),
]
