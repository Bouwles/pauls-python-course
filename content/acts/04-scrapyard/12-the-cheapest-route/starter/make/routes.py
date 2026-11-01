"""The quickest way round the circuit for Neil, in minutes on foot."""
import heapq

from workshop import show_graph

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

FEWEST_ROADS_TO_HAIRPIN = ["campsite", "main-gate", "fan-zone", "paddock", "hairpin"]


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
    print(f"Fewest roads to the hairpin: {route_minutes(MINUTES, FEWEST_ROADS_TO_HAIRPIN)} minutes")
    minutes, route = quickest_route(MINUTES, "campsite", "hairpin")
    print(f"Quickest to the hairpin: {minutes} minutes, by {', '.join(route)}")
    times = quickest_times(MINUTES, "campsite")
    furthest = max(times, key=times.get)
    print(f"Furthest from the campsite: {furthest}, {times[furthest]} minutes")
