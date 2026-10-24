import copy as _copy
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

FLOODED = {place: [n for n in near if n != "lighthouse"] for place, near in TOWN.items()}
FLOODED["lighthouse"] = []

ONE_WAY = {"quay": ["fish-market"], "fish-market": ["chapel", "net-loft"], "chapel": [], "net-loft": ["quay"]}

# "shed" and "boathouse" have no lists of their own: dead ends.
DEAD_ENDS = {"workshop": ["shed", "yard"], "yard": ["boathouse", "gate"], "gate": ["workshop"]}

SQUARE = {"pub": ["bakery", "tailor"], "bakery": ["pub", "library"], "tailor": ["pub", "library"], "library": ["bakery", "tailor"]}

ISLANDS = {"pier": ["slipway"], "slipway": ["pier"], "chapel": ["vicarage"], "vicarage": ["chapel"], "beach-hut": []}


class TooMany(Exception):
    pass


class CountingRoads(dict):
    """A map that counts every place whose roads are looked up."""

    def __init__(self, roads, limit):
        super().__init__(roads)
        self.lookups = 0
        self.limit = limit

    def tick(self, amount=1):
        self.lookups += amount
        if self.lookups > self.limit:
            raise TooMany()

    def __getitem__(self, place):
        self.tick()
        return super().__getitem__(place)

    def get(self, place, default=None):
        self.tick()
        return super().get(place, default)

    def items(self):
        self.tick(len(self))
        return super().items()

    def values(self):
        self.tick(len(self))
        return super().values()


def quiet(module):
    """Drawings are for Run. The checks switch them off, so they never cost a lookup."""
    for name in ("show_graph", "show_grid"):
        if hasattr(module, name):
            setattr(module, name, lambda *args, **kwargs: None)
    return module


def grid(size):
    """A town laid out as a size-by-size grid of streets."""
    roads = {}
    for row in range(size):
        for col in range(size):
            near = []
            for r, c in ((row - 1, col), (row, col + 1), (row + 1, col), (row, col - 1)):
                if 0 <= r < size and 0 <= c < size:
                    near.append(f"{r},{c}")
            roads[f"{row},{col}"] = near
    return roads


def true_distances(roads, start):
    distances = {start: 0}
    queue = _deque([start])
    while queue:
        place = queue.popleft()
        for neighbour in roads.get(place, []):
            if neighbour not in distances:
                distances[neighbour] = distances[place] + 1
                queue.append(neighbour)
    return distances


def true_round(roads, start):
    """The round, without recursion: a stack, roads pushed in reverse so the first listed is tried first."""
    order = []
    reached = set()
    stack = [start]
    while stack:
        place = stack.pop()
        if place in reached:
            continue
        reached.add(place)
        order.append(place)
        for neighbour in reversed(roads.get(place, [])):
            if neighbour not in reached:
                stack.append(neighbour)
    return order


def check_route(roads, start, goal, got):
    distances = true_distances(roads, start)
    if goal not in distances:
        if got is not None:
            raise CheckFailed(f"There's no way from {start} to {goal}, so fewest_roads should give back None.", expected="None", actual=repr(got))
        return
    if not isinstance(got, list) or not got:
        raise CheckFailed(f"From {start} to {goal} should be a list of places.", actual=repr(got))
    if got[0] != start or got[-1] != goal:
        raise CheckFailed(f"The route should start at {start} and end at {goal}.", actual=repr(got))
    for here, there in zip(got, got[1:]):
        if there not in roads.get(here, []):
            raise CheckFailed(f"There's no road from {here} to {there}.", actual=repr(got))
    if len(got) - 1 != distances[goal]:
        raise CheckFailed(f"That route is {len(got) - 1} roads. The fewest from {start} to {goal} is {distances[goal]}.",
                          expected=f"{distances[goal]} roads", actual=repr(got) if len(got) < 12 else f"{len(got) - 1} roads")


def route(roads, start, goal):
    def check(ctx):
        module = quiet(ctx.module())
        given = _copy.deepcopy(roads)
        got = module.fewest_roads(given, start, goal)
        check_route(roads, start, goal, got)
        if given != roads:
            raise CheckFailed("fewest_roads should leave the map as it found it.")
    return check


def round_of(roads, start, message):
    def check(ctx):
        module = quiet(ctx.module())
        given = _copy.deepcopy(roads)
        got = module.the_round(given, start)
        expected = true_round(roads, start)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
        if given != roads:
            raise CheckFailed("the_round should leave the map as it found it.")
    return check


def cut(roads, start, expected, message):
    def check(ctx):
        module = quiet(ctx.module())
        given = _copy.deepcopy(roads)
        got = module.cut_off(given, start)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
        if given != roads:
            raise CheckFailed("cut_off should leave the map as it found it.")
    return check


def dig_harbour(ctx):
    module = quiet(ctx.module())
    given = _copy.deepcopy(TOWN)
    got = module.close_road(given, "harbour-office", "lighthouse")
    if given != TOWN:
        raise CheckFailed("close_road changed the map it was given. Make new lists for the new map.")
    if not isinstance(got, dict):
        raise CheckFailed("close_road should give back a new map, a dictionary.", actual=repr(got))
    if got.get("harbour-office") != ["pub", "ferry", "crab-club"] or got.get("lighthouse") != []:
        raise CheckFailed("The road goes from both lists, and nothing else changes.",
                          expected={"harbour-office": ["pub", "ferry", "crab-club"], "lighthouse": []},
                          actual={"harbour-office": got.get("harbour-office"), "lighthouse": got.get("lighthouse")})
    others = {place: near for place, near in got.items() if place not in ("harbour-office", "lighthouse")}
    if others != {place: near for place, near in TOWN.items() if place not in ("harbour-office", "lighthouse")}:
        raise CheckFailed("Every other place should keep its roads.")


def dig_one_way(ctx):
    module = quiet(ctx.module())
    given = _copy.deepcopy(ONE_WAY)
    got = module.close_road(given, "chapel", "fish-market")
    expected = {"quay": ["fish-market"], "fish-market": ["net-loft"], "chapel": [], "net-loft": ["quay"]}
    if got != expected:
        raise CheckFailed("A one-way road goes too, whichever way round its ends are named.", expected=expected, actual=got)


def dig_nothing(ctx):
    module = quiet(ctx.module())
    given = _copy.deepcopy(SQUARE)
    got = module.close_road(given, "pub", "library")
    if got != SQUARE:
        raise CheckFailed("There's no road from the pub to the library, so the new map has the same roads.", expected=SQUARE, actual=got)
    got["pub"].append("chapel")
    if given != SQUARE:
        raise CheckFailed("The new map shares its lists with the old one: adding a road to the new map changed the old. Copy each list.")


def big_route(ctx):
    module = quiet(ctx.module())
    plain = grid(30)
    roads = CountingRoads(plain, 1800)
    try:
        got = module.fewest_roads(roads, "0,0", "29,29")
    except TooMany:
        raise CheckFailed("Crossing a town of 900 places looked up more than 1,800 places' roads. Breadth-first search looks up each place once.")
    check_route(plain, "0,0", "29,29", got)


def walled_off(ctx):
    module = quiet(ctx.module())
    plain = grid(30)
    for col in range(30):
        plain[f"14,{col}"] = []
        for near in plain.values():
            if f"14,{col}" in near:
                near.remove(f"14,{col}")
    roads = CountingRoads(plain, 1800)
    try:
        got = module.fewest_roads(roads, "0,0", "29,29")
    except TooMany:
        raise CheckFailed("Finding there's no way across a town of 900 places looked up more than 1,800 places' roads.")
    if got is not None:
        raise CheckFailed("A whole row of the town is dug up, so there's no way from 0,0 to 29,29.", expected="None", actual=repr(got))


def big_round(ctx):
    module = quiet(ctx.module())
    plain = grid(12)
    roads = CountingRoads(plain, 300)
    try:
        got = module.the_round(roads, "0,0")
    except TooMany:
        raise CheckFailed("The round of a town of 144 places looked up more than 300 places' roads. Each place should be explored once.")
    expected = true_round(plain, "0,0")
    if got != expected:
        first = next((index for index, (a, b) in enumerate(zip(got, expected)) if a != b), min(len(got), len(expected)))
        raise CheckFailed(f"On a grid of 144 places, the round goes wrong at stop number {first}.",
                          expected=expected[first] if first < len(expected) else "the end of the round",
                          actual=got[first] if first < len(got) else "the end of the round")


def big_cut(ctx):
    module = quiet(ctx.module())
    plain = grid(12)
    for col in range(12):
        plain[f"6,{col}"] = []
        for near in plain.values():
            if f"6,{col}" in near:
                near.remove(f"6,{col}")
    roads = CountingRoads(plain, 600)
    try:
        got = module.cut_off(roads, "0,0")
    except TooMany:
        raise CheckFailed("Finding who's cut off in a town of 144 places looked up more than 600 places' roads.")
    reached = set(true_distances(plain, "0,0"))
    expected = sorted(set(plain) - reached)
    if got != expected:
        raise CheckFailed("With row 6 dug up, everything in rows 6 to 11 is cut off from 0,0, in alphabetical order.",
                          expected=f"{len(expected)} places", actual=f"{len(got)} places" if isinstance(got, list) else repr(got))


def many_roads(ctx):
    module = quiet(ctx.module())
    for start, goal in [("lighthouse", "records-office"), ("crab-club", "library"), ("tailor", "ferry"), ("greengrocer", "scrapyard")]:
        check_route(TOWN, start, goal, module.fewest_roads(_copy.deepcopy(TOWN), start, goal))


TESTS = [
    function("Fewest roads to the ferry", call="fewest_roads", args=(TOWN, "scrapyard", "ferry"),
             expect=["scrapyard", "workshop", "bakery", "post-office", "ferry"], visible=True),
    function("The round from the scrapyard", call="the_round", args=(TOWN, "scrapyard"),
             expect=["scrapyard", "workshop", "bakery", "post-office", "pub", "harbour-office", "ferry", "crab-club", "bike-shed",
                     "greengrocer", "town-hall", "library", "tailor", "weather-station", "records-office", "observatory", "lighthouse"],
             visible=True),
    custom("Digging up the harbour road", dig_harbour,
           hint="Build a new dictionary with a new list for every place. Leave b out of a's list and a out of b's."),
    custom("Digging up a one-way road", dig_one_way),
    custom("Digging up a road that isn't there", dig_nothing,
           hint="list(neighbours) makes a new list. Without it, both maps share the same lists."),
    custom("Two routes, equally short", route(TOWN, "scrapyard", "lighthouse")),
    custom("All over town", many_roads),
    custom("Round a square", route(SQUARE, "pub", "library")),
    function("Already there", call="fewest_roads", args=(TOWN, "pub", "pub"), expect=["pub"],
             hint="If start is the goal, the route is just [start]."),
    function("The causeway's flooded", call="fewest_roads", args=(FLOODED, "workshop", "lighthouse"), expect=None,
             hint="When the queue runs out and the goal was never reached, give back None."),
    function("Against a one-way street", call="fewest_roads", args=(ONE_WAY, "chapel", "quay"), expect=None),
    function("Along a one-way street", call="fewest_roads", args=(ONE_WAY, "net-loft", "chapel"), expect=["net-loft", "quay", "fish-market", "chapel"]),
    custom("Past a dead end", route(DEAD_ENDS, "workshop", "gate"),
           hint="A place with no list of its own has no roads out. roads.get(place, []) treats it as a dead end."),
    custom("Across a town of 900 places", big_route,
           hint="Note each place in came_from when it's queued, and never queue a place that's already there."),
    custom("No way across, found quickly", walled_off),
    custom("The round from the lighthouse", round_of(TOWN, "lighthouse", "From the lighthouse the only road is to the harbour office, then the pub first.")),
    custom("A round with dead ends", round_of(DEAD_ENDS, "workshop", "Into the shed, back out, then the yard, the boathouse, and the gate."),
           hint="A dead end has no list of its own. Note it, and go back the way you came."),
    custom("A round of one-way streets", round_of(ONE_WAY, "fish-market", "From the fish market: the chapel, then the net loft, then the quay.")),
    function("A round with nowhere to go", call="the_round", args=({"beach-hut": []}, "beach-hut"), expect=["beach-hut"]),
    custom("A round of 144 places", big_round,
           hint="Try each place's roads in the order they're listed, and go all the way down the first new one before trying the next."),
    function("Cut off by the harbour works", call="cut_off",
             args=({**TOWN, "harbour-office": ["pub", "ferry", "crab-club"], "lighthouse": []}, "scrapyard"), expect=["lighthouse"]),
    function("Nobody cut off", call="cut_off", args=(TOWN, "workshop"), expect=[]),
    custom("Islands", cut(ISLANDS, "pier", ["beach-hut", "chapel", "vicarage"], "From the pier you can only reach the slipway. Everyone else, alphabetically.")),
    custom("Places with no list of their own", cut(DEAD_ENDS, "boathouse", ["gate", "shed", "workshop", "yard"],
                                                   "The boathouse has no roads out, so everywhere else is cut off, the shed included."),
           hint="Some places only appear in other places' lists. Count them as places on the map too."),
    custom("Up a one-way street", cut(ONE_WAY, "chapel", ["fish-market", "net-loft", "quay"], "The chapel has no roads out, so everything else is cut off.")),
    custom("Cut off in a town of 144 places", big_cut),
]
