"""Pip's fewest roads, from the scrapyard to anywhere."""
from saltmarsh import show_graph

ROADS = {
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


def fewest_roads(roads, start, goal):
    """The places from start to goal along the fewest roads, or None."""
    came_from = {start: None}
    queue = [start]
    while queue:
        place = queue.pop()
        if place == goal:
            break
        for neighbour in roads.get(place, []):
            if neighbour not in came_from:
                came_from[neighbour] = place
                queue.append(neighbour)
    if goal not in came_from:
        return None
    route = []
    place = goal
    while place is not None:
        route.append(place)
        place = came_from[place]
    route.reverse()
    return route


if __name__ == "__main__":
    route = fewest_roads(ROADS, "scrapyard", "ferry")
    print(f"{len(route) - 1} roads: {', '.join(route)}")
