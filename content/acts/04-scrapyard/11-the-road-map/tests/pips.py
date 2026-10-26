from collections import deque as _deque

TOWN = {
    "scrapyard": ["workshop", "tailor", "records-office"],
    "workshop": ["scrapyard", "bakery", "tailor"],
    "bakery": ["workshop", "post-office", "library"],
    "post-office": ["bakery", "pub", "town-hall", "ferry"],
    "pub": ["post-office", "harbour-office", "greengrocer"],
    "harbour-office": ["pub", "ferry", "crab-club", "lighthouse"],
    "ferry": ["post-office", "harbour-office"],
    "lighthouse": ["harbour-office"],
    "tailor": ["scrapyard", "workshop", "library"],
    "library": ["tailor", "bakery", "town-hall"],
    "town-hall": ["library", "post-office", "greengrocer", "weather-station"],
    "greengrocer": ["town-hall", "pub", "bike-shed"],
    "bike-shed": ["greengrocer", "crab-club", "observatory"],
    "crab-club": ["bike-shed", "harbour-office"],
    "records-office": ["scrapyard", "weather-station"],
    "weather-station": ["records-office", "town-hall", "observatory"],
    "observatory": ["weather-station", "bike-shed"],
}

# The tide's in: nothing reaches the lighthouse.
FLOODED = {place: [n for n in near if n != "lighthouse"] for place, near in TOWN.items()}
FLOODED["lighthouse"] = []


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
    function("The scrapyard to the ferry", call="fewest_roads", args=(TOWN, "scrapyard", "ferry"),
             expect=["scrapyard", "workshop", "bakery", "post-office", "ferry"], visible=True),
    custom("The scrapyard to the lighthouse", route(TOWN, "scrapyard", "lighthouse"), visible=True),
    custom("The library to the crab club", route(TOWN, "library", "crab-club"),
           hint="A breadth-first search takes places from the front of the queue: nearest first."),
    custom("The observatory to the tailor", route(TOWN, "observatory", "tailor")),
    function("Already there", call="fewest_roads", args=(TOWN, "pub", "pub"), expect=["pub"]),
    function("The causeway's flooded", call="fewest_roads", args=(FLOODED, "workshop", "lighthouse"), expect=None),
]
