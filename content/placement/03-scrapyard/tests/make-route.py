import copy as _copy
from collections import deque as _deque

TOWN = {
    "workshop": ["bakery", "post-office", "scrapyard"],
    "bakery": ["workshop", "pub", "greengrocer"],
    "post-office": ["workshop", "town-hall", "harbour-office"],
    "pub": ["bakery", "harbour-office"],
    "harbour-office": ["post-office", "pub", "ferry"],
    "ferry": ["harbour-office", "lighthouse"],
    "lighthouse": ["ferry"],
    "town-hall": ["post-office", "library", "tailor"],
    "library": ["town-hall"],
    "tailor": ["town-hall", "greengrocer"],
    "greengrocer": ["bakery", "tailor", "bike-shed"],
    "bike-shed": ["greengrocer", "scrapyard"],
    "scrapyard": ["bike-shed", "workshop"],
}

# The tide's in: the causeway to the lighthouse is under water.
FLOODED = {place: [n for n in near if n != "lighthouse"] for place, near in TOWN.items() if place != "lighthouse"}
FLOODED["lighthouse"] = []

ONE_WAY = {"quay": ["fish-market"], "fish-market": ["chapel"], "chapel": []}

DEAD_END = {"workshop": ["shed", "yard"], "yard": ["gate"], "gate": ["workshop"]}

SQUARE = {"pub": ["bakery", "tailor"], "bakery": ["pub", "library"], "tailor": ["pub", "library"], "library": ["bakery", "tailor"]}


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


def grid(size):
    """A town laid out in a size-by-size grid of streets, each corner joined to its neighbours."""
    roads = {}
    for row in range(size):
        for col in range(size):
            near = []
            for r, c in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
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


def check_route(roads, start, goal, got):
    distances = true_distances(roads, start)
    if goal not in distances:
        if got is not None:
            raise CheckFailed(f"There's no way from {start} to {goal}, so shortest_route should give back None.", expected="None", actual=repr(got))
        return
    if not isinstance(got, list) or not got:
        raise CheckFailed(f"From {start} to {goal} should be a list of places.", actual=repr(got))
    if got[0] != start or got[-1] != goal:
        raise CheckFailed(f"The route should start at {start} and end at {goal}.", actual=repr(got))
    for here, there in zip(got, got[1:]):
        if there not in roads.get(here, []):
            raise CheckFailed(f"There's no road from {here} to {there}.", actual=repr(got))
    if len(got) - 1 != distances[goal]:
        raise CheckFailed(f"That route is {len(got) - 1} roads. The shortest from {start} to {goal} is {distances[goal]}.",
                          expected=f"{distances[goal]} roads", actual=repr(got) if len(got) < 12 else f"{len(got) - 1} roads")


def route(roads, start, goal):
    def check(ctx):
        module = ctx.module()
        given = _copy.deepcopy(roads)
        got = module.shortest_route(given, start, goal)
        check_route(roads, start, goal, got)
        if given != roads:
            raise CheckFailed("shortest_route should leave the map as it found it.")
    return check


def away(roads, start, message):
    def check(ctx):
        module = ctx.module()
        given = _copy.deepcopy(roads)
        got = module.roads_away(given, start)
        expected = true_distances(roads, start)
        if got != expected:
            raise CheckFailed(message, expected=repr(expected), actual=repr(got))
        if given != roads:
            raise CheckFailed("roads_away should leave the map as it found it.")
    return check


def big_route(ctx):
    module = ctx.module()
    plain = grid(30)
    roads = CountingRoads(plain, 1800)
    try:
        got = module.shortest_route(roads, "0,0", "29,29")
    except TooMany:
        raise CheckFailed("Crossing a town of 900 places looked up more than 1,800 places' roads. Breadth-first search looks up each place once.")
    check_route(plain, "0,0", "29,29", got)


def big_away(ctx):
    module = ctx.module()
    plain = grid(30)
    roads = CountingRoads(plain, 1800)
    try:
        got = module.roads_away(roads, "15,15")
    except TooMany:
        raise CheckFailed("Measuring a town of 900 places looked up more than 1,800 places' roads. Breadth-first search looks up each place once.")
    expected = true_distances(plain, "15,15")
    if got != expected:
        wrong = [place for place in expected if got.get(place) != expected[place]] if isinstance(got, dict) else []
        raise CheckFailed("Every one of the 900 places, and its number of roads from 15,15.",
                          expected=f"{len(expected)} places", actual=f"{len(got)} places, {len(wrong)} wrong" if isinstance(got, dict) else repr(got))


def walled_off(ctx):
    module = ctx.module()
    plain = grid(30)
    for col in range(30):
        plain["14," + str(col)] = []
        for place, near in plain.items():
            if "14," + str(col) in near:
                near.remove("14," + str(col))
    roads = CountingRoads(plain, 1800)
    try:
        got = module.shortest_route(roads, "0,0", "29,29")
    except TooMany:
        raise CheckFailed("Finding there's no way across a town of 900 places looked up more than 1,800 places' roads.")
    if got is not None:
        raise CheckFailed("A row of the town is walled off, so there's no way from 0,0 to 29,29.", expected="None", actual=repr(got))


TESTS = [
    function("The scrapyard to the ferry", call="shortest_route", args=(TOWN, "scrapyard", "ferry"),
             expect=["scrapyard", "workshop", "post-office", "harbour-office", "ferry"], visible=True),
    function("How far from the lighthouse", call="roads_away",
             args=({"lighthouse": ["ferry"], "ferry": ["lighthouse", "harbour-office"], "harbour-office": ["ferry"]}, "lighthouse"),
             expect={"lighthouse": 0, "ferry": 1, "harbour-office": 2}, visible=True),
    custom("The library to the lighthouse", route(TOWN, "library", "lighthouse")),
    custom("Next door", route(TOWN, "bakery", "pub")),
    function("Already there", call="shortest_route", args=(TOWN, "pub", "pub"), expect=["pub"],
             hint="If start is the goal, the route is just [start]."),
    custom("Two routes, equally short", route(SQUARE, "pub", "library"),
           hint="Either way round the square will do, as long as it's two roads."),
    function("The causeway's flooded", call="shortest_route", args=(FLOODED, "workshop", "lighthouse"), expect=None,
             hint="When there's nowhere left to try, give back None."),
    function("Against a one-way street", call="shortest_route", args=(ONE_WAY, "chapel", "quay"), expect=None),
    function("Down a one-way street", call="shortest_route", args=(ONE_WAY, "quay", "chapel"), expect=["quay", "fish-market", "chapel"]),
    function("Into a dead end", call="shortest_route", args=(DEAD_END, "workshop", "shed"), expect=["workshop", "shed"]),
    custom("Past a dead end", route(DEAD_END, "workshop", "gate"),
           hint="A place with no list of its own has no roads out. roads.get(place, []) treats it as a dead end."),
    custom("Everywhere from the workshop", away(TOWN, "workshop", "Every place in town and its number of roads from the workshop.")),
    custom("Not past the flood", away(FLOODED, "pub", "The lighthouse can't be reached, so it isn't in the dictionary.")),
    custom("One way only", away(ONE_WAY, "fish-market", "From the fish market you can only reach the chapel.")),
    custom("Dead ends counted", away(DEAD_END, "workshop", "The shed is one road away, even with no roads out.")),
    function("Nowhere to go", call="roads_away", args=({"lighthouse": []}, "lighthouse"), expect={"lighthouse": 0}),
    custom("Across a town of 900 places", big_route,
           hint="Keep a record of every place you've already reached, and never queue a place twice."),
    custom("All 900 places measured", big_away,
           hint="Each place's distance is one more than the place you first reached it from."),
    custom("No way across, found quickly", walled_off),
]
