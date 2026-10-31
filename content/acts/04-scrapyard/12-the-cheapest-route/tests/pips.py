import heapq as _heapq

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

CLOSED = {place: {n: m for n, m in near.items() if n != "stadium"} for place, near in MINUTES.items()}
CLOSED["stadium"] = {}


def quiet(module):
    """Drawings are for Run. The checks switch them off."""
    for name in ("show_graph", "show_grid"):
        if hasattr(module, name):
            setattr(module, name, lambda *args, **kwargs: None)
    return module


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


def quickest(roads, start, goal):
    def check(ctx):
        module = quiet(ctx.module())
        got = module.quickest_route(roads, start, goal)
        want = true_best(roads, start)[goal]
        if not isinstance(got, tuple) or len(got) != 2:
            raise CheckFailed("quickest_route should give back (minutes, route).", actual=repr(got))
        minutes, route = got
        if minutes != want:
            raise CheckFailed(f"The quickest from {start} to {goal} is {want} minutes.", expected=want, actual=minutes)
        total = 0
        for here, there in zip(route, route[1:]):
            if there not in roads.get(here, {}):
                raise CheckFailed(f"There's no road from {here} to {there}.", actual=route)
            total += roads[here][there]
        if route[:1] != [start] or route[-1:] != [goal] or total != want:
            raise CheckFailed(f"The route should go from {start} to {goal} and take {want} minutes.", actual=route)
    return check


TESTS = [
    function("The market to the clocktower", call="quickest_route", args=(MINUTES, "market", "clocktower"),
             expect=(7, ["market", "bookshop", "clocktower"]), visible=True),
    function("The market to the theatre", call="quickest_route", args=(MINUTES, "market", "theatre"),
             expect=(14, ["market", "bookshop", "library", "city-hall", "station", "theatre"]), visible=True),
    custom("Round the triangle", quickest(TRIANGLE, "square", "church"),
           hint="When a quicker way to a place turns up, its minutes and its came_from should change, and it goes back on the heap."),
    custom("The long way round", quickest(LONG_WAY, "home", "office"),
           hint="Four one-minute roads beat one ten-minute road. The office is seen first at 10, and that mustn't be final."),
    custom("The stadium", quickest(MINUTES, "park", "stadium")),
    function("Already there", call="quickest_route", args=(MINUTES, "cinema", "cinema"), expect=(0, ["cinema"])),
    function("The road to the stadium is closed", call="quickest_route", args=(CLOSED, "clocktower", "stadium"), expect=None),
]
