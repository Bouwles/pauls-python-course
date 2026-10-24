"""The roads of Saltmarsh: each place, and the places one road away."""
from collections import deque

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
    print(shortest_route(TOWN, "scrapyard", "ferry"))
    print(roads_away(TOWN, "lighthouse"))
