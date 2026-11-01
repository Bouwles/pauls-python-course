"""Caitlin's quickest route round the circuit, in minutes."""
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
    minutes, route = quickest_route(MINUTES, "campsite", "main-gate")
    print(f"{minutes} minutes: {', '.join(route)}")
