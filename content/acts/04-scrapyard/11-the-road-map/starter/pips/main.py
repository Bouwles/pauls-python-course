"""Yahya's fewest roads, from the market to anywhere."""
from workshop import show_graph

ROADS = {
    "market": ["clocktower", "bookshop", "museum"],
    "clocktower": ["market", "cafe", "bookshop"],
    "cafe": ["clocktower", "station", "library"],
    "station": ["cafe", "cinema", "city-hall", "theatre"],
    "cinema": ["station", "bridge", "school"],
    "bridge": ["cinema", "theatre", "pool", "stadium"],
    "theatre": ["station", "bridge"],
    "stadium": ["bridge"],
    "bookshop": ["market", "clocktower", "library"],
    "library": ["bookshop", "cafe", "city-hall"],
    "city-hall": ["library", "station", "school", "gallery"],
    "school": ["city-hall", "cinema", "gym"],
    "gym": ["school", "pool", "park"],
    "pool": ["gym", "bridge"],
    "museum": ["market", "gallery"],
    "gallery": ["museum", "city-hall", "park"],
    "park": ["gallery", "gym"],
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
    route = fewest_roads(ROADS, "market", "theatre")
    print(f"{len(route) - 1} roads: {', '.join(route)}")
