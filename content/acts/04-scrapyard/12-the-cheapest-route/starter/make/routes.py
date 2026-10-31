"""The quickest way round the city for Riya, in minutes."""
import heapq

from workshop import show_graph

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

FEWEST_ROADS_TO_THEATRE = ["market", "clocktower", "cafe", "station", "theatre"]


def route_minutes(roads, route):
    """The minutes along route. ValueError if two places next to each other have no road between them."""


def quickest_times(roads, start):
    """Every place that can be reached from start, and the fewest minutes it takes to get there."""
    # The start is 0 minutes away; nothing is settled yet
    # While anywhere is waiting
    #     Take the nearest waiting place
    #     Settled already? Then this is an old entry: skip it
    #     Settle it
    #     Down each road: if this way is quicker, note the minutes and put it in waiting


def quickest_route(roads, start, goal):
    """(minutes, route) for the quickest way from start to goal, (0, [start]) if they're the same, or None."""


if __name__ == "__main__":
    print(f"Fewest roads to the theatre: {route_minutes(MINUTES, FEWEST_ROADS_TO_THEATRE)} minutes")
    minutes, route = quickest_route(MINUTES, "market", "theatre")
    print(f"Quickest to the theatre: {minutes} minutes, by {', '.join(route)}")
    times = quickest_times(MINUTES, "market")
    furthest = max(times, key=times.get)
    print(f"Furthest from the market: {furthest}, {times[furthest]} minutes")
