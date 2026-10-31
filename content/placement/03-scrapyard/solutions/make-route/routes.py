"""The roads round the Clocktower: each place, and the places one road away."""
from collections import deque

CITY = {
    "clocktower": ["cafe", "station", "gym"],
    "cafe": ["clocktower", "cinema", "pool"],
    "station": ["clocktower", "museum", "bridge"],
    "cinema": ["cafe", "bridge"],
    "bridge": ["station", "cinema", "park"],
    "park": ["bridge", "boathouse"],
    "boathouse": ["park"],
    "museum": ["station", "library", "market"],
    "library": ["museum"],
    "market": ["museum", "pool"],
    "pool": ["cafe", "market", "bus-stop"],
    "bus-stop": ["pool", "gym"],
    "gym": ["bus-stop", "clocktower"],
}


def shortest_route(roads, start, goal):
    """The places from start to goal along the fewest roads, or None."""
    came_from = {start: None}
    queue = deque([start])
    while queue:
        place = queue.popleft()
        if place == goal:
            route = []
            while place is not None:
                route.append(place)
                place = came_from[place]
            route.reverse()
            return route
        for neighbour in roads.get(place, []):
            if neighbour not in came_from:
                came_from[neighbour] = place
                queue.append(neighbour)
    return None


def roads_away(roads, start):
    """Every place reachable from start, and how many roads away it is."""
    distances = {start: 0}
    queue = deque([start])
    while queue:
        place = queue.popleft()
        for neighbour in roads.get(place, []):
            if neighbour not in distances:
                distances[neighbour] = distances[place] + 1
                queue.append(neighbour)
    return distances


if __name__ == "__main__":
    print(shortest_route(CITY, "gym", "park"))
    print(roads_away(CITY, "boathouse"))
