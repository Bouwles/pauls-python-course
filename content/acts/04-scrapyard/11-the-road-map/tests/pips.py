from collections import deque as _deque

CITY = {
    "market": ["clocktower", "bookshop", "museum"],
    "clocktower": ["market", "cafe", "bookshop"],
    "cafe": ["clocktower", "station", "library"],
    "station": ["cafe", "cinema", "city-hall", "theatre"],
    "cinema": ["station", "bridge", "school"],
    "bridge": ["cinema", "theatre", "pool", "stadium"],
    "theatre": ["station", "bridge"],
    "stadium": ["bridge"],
    "bookshop": ["market", "clocktower", "library"],
    "library": ["bookshop", "cafe", "city-hall"],
    "city-hall": ["library", "station", "school", "gallery"],
    "school": ["city-hall", "cinema", "gym"],
    "gym": ["school", "pool", "park"],
    "pool": ["gym", "bridge"],
    "museum": ["market", "gallery"],
    "gallery": ["museum", "city-hall", "park"],
    "park": ["gallery", "gym"],
}

# Road works: nothing reaches the stadium.
CLOSED = {place: [n for n in near if n != "stadium"] for place, near in CITY.items()}
CLOSED["stadium"] = []


def quiet(module):
    """Drawings are for Run. The checks switch them off."""
    for name in ("show_graph", "show_grid"):
        if hasattr(module, name):
            setattr(module, name, lambda *args, **kwargs: None)
    return module


def fewest(roads, start):
    distances = {start: 0}
    queue = _deque([start])
    while queue:
        place = queue.popleft()
        for neighbour in roads.get(place, []):
            if neighbour not in distances:
                distances[neighbour] = distances[place] + 1
                queue.append(neighbour)
    return distances


def route(roads, start, goal):
    def check(ctx):
        module = quiet(ctx.module())
        got = module.fewest_roads(roads, start, goal)
        distances = fewest(roads, start)
        if not isinstance(got, list) or not got or got[0] != start or got[-1] != goal:
            raise CheckFailed(f"The route should be a list from {start} to {goal}.", actual=repr(got))
        for here, there in zip(got, got[1:]):
            if there not in roads.get(here, []):
                raise CheckFailed(f"There's no road from {here} to {there}.", actual=repr(got))
        if len(got) - 1 != distances[goal]:
            raise CheckFailed(f"That's {len(got) - 1} roads. The fewest from {start} to {goal} is {distances[goal]}.",
                              expected=f"{distances[goal]} roads", actual=", ".join(got))
    return check


TESTS = [
    function("The market to the theatre", call="fewest_roads", args=(CITY, "market", "theatre"),
             expect=["market", "clocktower", "cafe", "station", "theatre"], visible=True),
    custom("The market to the stadium", route(CITY, "market", "stadium"), visible=True),
    custom("The library to the pool", route(CITY, "library", "pool"),
           hint="A breadth-first search takes places from the front of the queue: nearest first."),
    custom("The park to the bookshop", route(CITY, "park", "bookshop")),
    function("Already there", call="fewest_roads", args=(CITY, "cinema", "cinema"), expect=["cinema"]),
    function("The road to the stadium is closed", call="fewest_roads", args=(CLOSED, "clocktower", "stadium"), expect=None),
]
