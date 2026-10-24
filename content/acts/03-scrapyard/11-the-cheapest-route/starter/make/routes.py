"""The quickest way round Saltmarsh for Nell's lorry, in minutes."""
import heapq

from saltmarsh import show_graph

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

FEWEST_ROADS_TO_FERRY = ["scrapyard", "workshop", "bakery", "post-office", "ferry"]


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
    print(f"Fewest roads to the ferry: {route_minutes(MINUTES, FEWEST_ROADS_TO_FERRY)} minutes")
    minutes, route = quickest_route(MINUTES, "scrapyard", "ferry")
    print(f"Quickest to the ferry: {minutes} minutes, by {', '.join(route)}")
    times = quickest_times(MINUTES, "scrapyard")
    furthest = max(times, key=times.get)
    print(f"Furthest from the yard: {furthest}, {times[furthest]} minutes")
