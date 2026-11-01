"""Yahya's fewest roads round the circuit, from the campsite to anywhere."""
from collections import deque

from workshop import show_graph

ROADS = {
    "campsite": ["main-gate", "food-court", "car-park"],
    "main-gate": ["campsite", "fan-zone", "food-court"],
    "fan-zone": ["main-gate", "paddock", "merch-stand"],
    "paddock": ["fan-zone", "big-screen", "grandstand", "hairpin"],
    "big-screen": ["paddock", "footbridge", "chicane"],
    "footbridge": ["big-screen", "hairpin", "tunnel", "viewing-bank"],
    "hairpin": ["paddock", "footbridge"],
    "viewing-bank": ["footbridge"],
    "food-court": ["campsite", "main-gate", "merch-stand"],
    "merch-stand": ["food-court", "fan-zone", "grandstand"],
    "grandstand": ["merch-stand", "paddock", "chicane", "media-centre"],
    "chicane": ["grandstand", "big-screen", "kart-track"],
    "kart-track": ["chicane", "tunnel", "back-straight"],
    "tunnel": ["kart-track", "footbridge"],
    "car-park": ["campsite", "media-centre"],
    "media-centre": ["car-park", "grandstand", "back-straight"],
    "back-straight": ["media-centre", "kart-track"],
}


def fewest_roads(roads, start, goal):
    """The places from start to goal along the fewest roads, or None."""
    came_from = {start: None}
    queue = deque([start])
    while queue:
        place = queue.popleft()
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
    route = fewest_roads(ROADS, "campsite", "hairpin")
    print(f"{len(route) - 1} roads: {', '.join(route)}")
