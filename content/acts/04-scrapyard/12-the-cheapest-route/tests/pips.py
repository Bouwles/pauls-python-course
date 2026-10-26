import heapq as _heapq

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

FLOODED = {place: {n: m for n, m in near.items() if n != "lighthouse"} for place, near in MINUTES.items()}
FLOODED["lighthouse"] = {}


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
    function("The scrapyard to the workshop", call="quickest_route", args=(MINUTES, "scrapyard", "workshop"),
             expect=(7, ["scrapyard", "tailor", "workshop"]), visible=True),
    function("The scrapyard to the ferry", call="quickest_route", args=(MINUTES, "scrapyard", "ferry"),
             expect=(14, ["scrapyard", "tailor", "library", "town-hall", "post-office", "ferry"]), visible=True),
    custom("Round the triangle", quickest(TRIANGLE, "quay", "chapel"),
           hint="When a quicker way to a place turns up, its minutes and its came_from should change, and it goes back on the heap."),
    custom("The long way round", quickest(LONG_WAY, "gate", "boathouse"),
           hint="Four one-minute roads beat one ten-minute road. The boathouse is seen first at 10, and that mustn't be final."),
    custom("The lighthouse", quickest(MINUTES, "observatory", "lighthouse")),
    function("Already there", call="quickest_route", args=(MINUTES, "pub", "pub"), expect=(0, ["pub"])),
    function("The causeway's flooded", call="quickest_route", args=(FLOODED, "workshop", "lighthouse"), expect=None),
]
