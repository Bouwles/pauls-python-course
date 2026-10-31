"""Caitlin's quickest route across the city, in minutes."""
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


def quickest_route(roads, start, goal):
    """(minutes, route) for the quickest way from start to goal, or None."""
    best = {start: 0}
    came_from = {start: None}
    waiting = [(0, start)]
    while waiting:
        minutes, place = heapq.heappop(waiting)
        if place == goal:
            break
        for neighbour, road in roads.get(place, {}).items():
            if neighbour not in best:
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
    minutes, route = quickest_route(MINUTES, "market", "clocktower")
    print(f"{minutes} minutes: {', '.join(route)}")
