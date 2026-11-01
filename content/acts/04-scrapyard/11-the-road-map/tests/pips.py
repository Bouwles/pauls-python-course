from collections import deque as _deque

CITY = {
    "campsite": ["main-gate", "food-court", "car-park"],
    "main-gate": ["campsite", "fan-zone", "food-court"],
    "fan-zone": ["main-gate", "paddock", "merch-stand"],
    "paddock": ["fan-zone", "big-screen", "grandstand", "hairpin"],
    "big-screen": ["paddock", "footbridge", "chicane"],
    "footbridge": ["big-screen", "hairpin", "tunnel", "viewing-bank"],
    "hairpin": ["paddock", "footbridge"],
    "viewing-bank": ["footbridge"],
    "food-court": ["campsite", "main-gate", "merch-stand"],
    "merch-stand": ["food-court", "fan-zone", "grandstand"],
    "grandstand": ["merch-stand", "paddock", "chicane", "media-centre"],
    "chicane": ["grandstand", "big-screen", "kart-track"],
    "kart-track": ["chicane", "tunnel", "back-straight"],
    "tunnel": ["kart-track", "footbridge"],
    "car-park": ["campsite", "media-centre"],
    "media-centre": ["car-park", "grandstand", "back-straight"],
    "back-straight": ["media-centre", "kart-track"],
}

# Closed off: nothing reaches the viewing bank.
CLOSED = {place: [n for n in near if n != "viewing-bank"] for place, near in CITY.items()}
CLOSED["viewing-bank"] = []


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
    function("The campsite to the hairpin", call="fewest_roads", args=(CITY, "campsite", "hairpin"),
             expect=["campsite", "main-gate", "fan-zone", "paddock", "hairpin"], visible=True),
    custom("The campsite to the viewing bank", route(CITY, "campsite", "viewing-bank"), visible=True),
    custom("The merch stand to the tunnel", route(CITY, "merch-stand", "tunnel"),
           hint="A breadth-first search takes places from the front of the queue: nearest first."),
    custom("The back straight to the food court", route(CITY, "back-straight", "food-court")),
    function("Already there", call="fewest_roads", args=(CITY, "big-screen", "big-screen"), expect=["big-screen"]),
    function("The road to the viewing bank is closed", call="fewest_roads", args=(CLOSED, "main-gate", "viewing-bank"), expect=None),
]
