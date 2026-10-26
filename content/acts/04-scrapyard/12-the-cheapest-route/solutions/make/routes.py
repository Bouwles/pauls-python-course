"""The quickest way round {{town}} for Nell's lorry, in minutes."""
import heapq

from workshop import show_graph

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
    total = 0
    for here, there in zip(route, route[1:]):
        if there not in roads.get(here, {}):
            raise ValueError(f"there's no road from {here} to {there}")
        total = total + roads[here][there]
    return total


def quickest_times(roads, start):
    """Every place that can be reached from start, and the fewest minutes it takes to get there."""
    # The start is 0 minutes away; nothing is settled yet
    best = {start: 0}
    settled = set()
    waiting = [(0, start)]
    # While anywhere is waiting
    while waiting:
        # Take the nearest waiting place
        minutes, place = heapq.heappop(waiting)
        # Settled already? Then this is an old entry: skip it
        if place in settled:
            continue
        # Settle it
        settled.add(place)
        show_graph(roads, visited=settled, frontier=[name for _, name in waiting], current=place, distances=best)
        # Down each road: if this way is quicker, note the minutes and put it in waiting
        for neighbour, road in roads.get(place, {}).items():
            if neighbour not in best or minutes + road < best[neighbour]:
                best[neighbour] = minutes + road
                heapq.heappush(waiting, (best[neighbour], neighbour))
    return best


def quickest_route(roads, start, goal):
    """(minutes, route) for the quickest way from start to goal, (0, [start]) if they're the same, or None."""
    best = {start: 0}
    came_from = {start: None}
    settled = set()
    waiting = [(0, start)]
    while waiting:
        minutes, place = heapq.heappop(waiting)
        if place in settled:
            continue
        settled.add(place)
        if place == goal:
            route = []
            while place is not None:
                route.append(place)
                place = came_from[place]
            route.reverse()
            show_graph(roads, visited=settled, path=route, distances=best)
            return minutes, route
        for neighbour, road in roads.get(place, {}).items():
            if neighbour not in best or minutes + road < best[neighbour]:
                best[neighbour] = minutes + road
                came_from[neighbour] = place
                heapq.heappush(waiting, (best[neighbour], neighbour))
    return None


if __name__ == "__main__":
    print(f"Fewest roads to the ferry: {route_minutes(MINUTES, FEWEST_ROADS_TO_FERRY)} minutes")
    minutes, route = quickest_route(MINUTES, "scrapyard", "ferry")
    print(f"Quickest to the ferry: {minutes} minutes, by {', '.join(route)}")
    times = quickest_times(MINUTES, "scrapyard")
    furthest = max(times, key=times.get)
    print(f"Furthest from the yard: {furthest}, {times[furthest]} minutes")
