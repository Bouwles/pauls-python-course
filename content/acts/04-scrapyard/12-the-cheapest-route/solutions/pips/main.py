"""Pip's quickest route for Nell's lorry, in minutes."""
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


def quickest_route(roads, start, goal):
    """(minutes, route) for the quickest way from start to goal, or None."""
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
            break
        for neighbour, road in roads.get(place, {}).items():
            if neighbour not in best or minutes + road < best[neighbour]:
                best[neighbour] = minutes + road
                came_from[neighbour] = place
                heapq.heappush(waiting, (best[neighbour], neighbour))
    if goal not in best:
        return None
    route = []
    place = goal
    while place is not None:
        route.append(place)
        place = came_from[place]
    route.reverse()
    return best[goal], route


if __name__ == "__main__":
    minutes, route = quickest_route(MINUTES, "scrapyard", "workshop")
    print(f"{minutes} minutes: {', '.join(route)}")
