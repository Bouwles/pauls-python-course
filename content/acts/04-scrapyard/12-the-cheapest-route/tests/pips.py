import heapq as _heapq

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

CLOSED = {place: {n: m for n, m in near.items() if n != "viewing-bank"} for place, near in MINUTES.items()}
CLOSED["viewing-bank"] = {}


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
    function("The campsite to the main gate", call="quickest_route", args=(MINUTES, "campsite", "main-gate"),
             expect=(7, ["campsite", "food-court", "main-gate"]), visible=True),
    function("The campsite to the hairpin", call="quickest_route", args=(MINUTES, "campsite", "hairpin"),
             expect=(14, ["campsite", "food-court", "merch-stand", "grandstand", "paddock", "hairpin"]), visible=True),
    custom("Round the triangle", quickest(TRIANGLE, "garage", "pit-wall"),
           hint="When a quicker way to a place turns up, its minutes and its came_from should change, and it goes back on the heap."),
    custom("The long way round", quickest(LONG_WAY, "tent", "pit-lane"),
           hint="Four one-minute roads beat one ten-minute road. The pit lane is seen first at 10, and that mustn't be final."),
    custom("The viewing bank", quickest(MINUTES, "back-straight", "viewing-bank")),
    function("Already there", call="quickest_route", args=(MINUTES, "big-screen", "big-screen"), expect=(0, ["big-screen"])),
    function("The road to the viewing bank is closed", call="quickest_route", args=(CLOSED, "main-gate", "viewing-bank"), expect=None),
]
