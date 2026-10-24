"""Saltmarsh's roads, and the questions Nell asks of them."""
from collections import deque

from saltmarsh import show_graph

ROADS = {
    "scrapyard": ["workshop", "tailor", "records-office"],
    "workshop": ["scrapyard", "bakery", "tailor"],
    "bakery": ["workshop", "post-office", "library"],
    "post-office": ["bakery", "pub", "town-hall", "ferry"],
    "pub": ["post-office", "harbour-office", "greengrocer"],
    "harbour-office": ["pub", "ferry", "crab-club", "lighthouse"],
    "ferry": ["post-office", "harbour-office"],
    # The lighthouse is a dead end on this map: one road in, and the same
    # road out. Tom says that's the whole point of a lighthouse. I've come
    # round to his way of thinking. A.P.
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


def close_road(roads, a, b):
    """A new map without the road between a and b, either way. roads is left as it was."""


def fewest_roads(roads, start, goal):
    """The places from start to goal along the fewest roads, [start] if they're the same, or None."""
    # Mark the start as reached, and queue it
    # While anything is queued
    #     Take the place at the front
    #     Look down each road
    #         If it leads somewhere new: note where it was reached from, and queue it
    # Follow the notes back from the goal


def the_round(roads, start):
    """Every place Penhallow's round reaches from start, in the order it first reaches them."""


def cut_off(roads, start):
    """Every place on the map that can't be reached from start, in alphabetical order."""


if __name__ == "__main__":
    route = fewest_roads(ROADS, "scrapyard", "ferry")
    print(f"Fewest roads to the ferry: {', '.join(route)}")
    print(f"The round: {', '.join(the_round(ROADS, 'scrapyard'))}")
    dug_up = close_road(ROADS, "harbour-office", "lighthouse")
    print(f"With the harbour road dug up, cut off: {', '.join(cut_off(dug_up, 'scrapyard'))}")
