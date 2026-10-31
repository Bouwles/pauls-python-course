import copy as _copy
import heapq as _heapq
import random as _random

MINUTES = {
    "market": {"clocktower": 8, "bookshop": 4, "museum": 7},
    "clocktower": {"market": 8, "cafe": 2, "bookshop": 3},
    "cafe": {"clocktower": 2, "station": 2, "library": 3},
    "station": {"cafe": 2, "cinema": 3, "city-hall": 2, "theatre": 4},
    "cinema": {"station": 3, "bridge": 2, "school": 3},
    "bridge": {"cinema": 2, "theatre": 3, "pool": 4, "stadium": 9},
    "theatre": {"station": 4, "bridge": 3},
    "stadium": {"bridge": 9},
    "bookshop": {"market": 4, "clocktower": 3, "library": 2},
    "library": {"bookshop": 2, "cafe": 3, "city-hall": 2},
    "city-hall": {"library": 2, "station": 2, "school": 3, "gallery": 8},
    "school": {"city-hall": 3, "cinema": 3, "gym": 2},
    "gym": {"school": 2, "pool": 3, "park": 10},
    "pool": {"gym": 3, "bridge": 4},
    "museum": {"market": 7, "gallery": 3},
    "gallery": {"museum": 3, "city-hall": 8, "park": 6},
    "park": {"gallery": 6, "gym": 10},
}

TRIANGLE = {"square": {"church": 10, "florist": 3}, "florist": {"square": 3, "church": 4}, "church": {"square": 10, "florist": 4}}

LONG_WAY = {"home": {"bus-stop": 1, "office": 10}, "bus-stop": {"crossing": 1}, "crossing": {"alley": 1}, "alley": {"office": 1}}

# The car park has no dictionary of its own: a dead end. One-way roads throughout.
ONE_WAY = {"square": {"food-market": 2, "car-park": 9}, "food-market": {"church": 3}, "church": {"square": 1}}

FREE_ROAD = {"cafe": {"lift": 0, "roof": 5}, "lift": {"roof": 2}, "roof": {}}

SQUARE = {"cinema": {"cafe": 2, "bookshop": 3}, "cafe": {"cinema": 2, "library": 3}, "bookshop": {"cinema": 3, "library": 2}, "library": {"cafe": 3, "bookshop": 2}}

CLOSED = {place: {n: m for n, m in near.items() if n != "stadium"} for place, near in MINUTES.items()}
CLOSED["stadium"] = {}


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
        got = module.route_minutes(MINUTES, ["market", "cafe", "station"])
    except ValueError as problem:
        message = str(problem)
        if "market" not in message or "cafe" not in message:
            raise CheckFailed("The ValueError should name both places, so Riya knows which road is missing.", expected="market and cafe", actual=message)
        return
    raise CheckFailed("There's no road from the market to the cafe, so route_minutes should raise ValueError.", expected="ValueError", actual=repr(got))


def against_one_way(ctx):
    module = quiet(ctx.module())
    try:
        got = module.route_minutes(ONE_WAY, ["food-market", "square"])
    except ValueError:
        return
    raise CheckFailed("The road from the square to the food market is one way, so going back is no road at all.", expected="ValueError", actual=repr(got))


def big_times(ctx):
    module = quiet(ctx.module())
    plain = weighted_grid(30, 11)
    roads, tally = counting(plain, 1000)
    try:
        got = module.quickest_times(roads, "0,0")
    except TooMany:
        raise CheckFailed("Timing a city of 900 places went through places' roads more than 1,000 times. Settle each place once, and skip old entries when they come off the heap.")
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
        raise CheckFailed("Crossing a city of 900 places went through places' roads more than 1,000 times. Settle each place once, and skip old entries when they come off the heap.")
    check_route(plain, "0,0", "29,29", got)


TESTS = [
    function("Fewest roads to the theatre, in minutes", call="route_minutes",
             args=(MINUTES, ["market", "clocktower", "cafe", "station", "theatre"]), expect=16, visible=True),
    function("Quickest to the theatre", call="quickest_route", args=(MINUTES, "market", "theatre"),
             expect=(14, ["market", "bookshop", "library", "city-hall", "station", "theatre"]), visible=True),
    function("A route of one place", call="route_minutes", args=(MINUTES, ["cinema"]), expect=0),
    function("No route at all", call="route_minutes", args=(MINUTES, []), expect=0),
    function("To the gallery and back", call="route_minutes", args=(MINUTES, ["city-hall", "gallery", "city-hall"]), expect=16),
    custom("A road that isn't there", no_road,
           hint="Check the next place is in this place's dictionary before you add its minutes, and raise ValueError naming both if it isn't."),
    custom("Against a one-way road", against_one_way),
    custom("Every time from the market", times(MINUTES, "market", "The fewest minutes from the market to every place in the city.")),
    custom("Every time from the stadium", times(MINUTES, "stadium", "From the stadium, everything starts with nine minutes to the bridge.")),
    custom("Times round the triangle", times(TRIANGLE, "square", "The church is 7 minutes away, by the florist, not 10."),
           hint="A place's minutes can still go down after you've first seen it. Only a place that's come off the heap is settled."),
    custom("Times the long way round", times(LONG_WAY, "home", "Four one-minute roads to the office beat the ten-minute one.")),
    custom("Times with one-way roads and a dead end", times(ONE_WAY, "square", "From the square: the food market, the church, and the car park, which has no roads out."),
           hint="A place with no dictionary of its own has no roads out. roads.get(place, {}) treats it as a dead end."),
    custom("A road that takes no time", times(FREE_ROAD, "cafe", "The lift is 0 minutes away, and the roof 2, through the lift.")),
    custom("Nobody reaches the stadium", times(CLOSED, "clocktower", "With its road closed, the stadium can't be reached, so it isn't in the dictionary.")),
    custom("Times in a city of 900 places", big_times),
    function("Already there", call="quickest_route", args=(MINUTES, "cinema", "cinema"), expect=(0, ["cinema"])),
    function("The road to the stadium is closed", call="quickest_route", args=(CLOSED, "clocktower", "stadium"), expect=None,
             hint="When nothing is left waiting and the goal was never reached, give back None."),
    custom("The stadium from the park", quickest(MINUTES, "park", "stadium")),
    custom("Round the triangle", quickest(TRIANGLE, "square", "church"),
           hint="When a quicker way to a place turns up, change its minutes and where it came from, and put it back in waiting."),
    custom("The long way round", quickest(LONG_WAY, "home", "office")),
    custom("Two routes, equally quick", quickest(SQUARE, "cinema", "library")),
    custom("Down one-way roads", quickest(ONE_WAY, "food-market", "car-park")),
    function("Up a one-way road", call="quickest_route", args=(ONE_WAY, "car-park", "square"), expect=None),
    custom("Across a city of 900 places", big_route),
    structure("Uses heapq", calls=["heappop"], message="Keep the waiting places in a heap, with heapq.heappush and heapq.heappop."),
]
