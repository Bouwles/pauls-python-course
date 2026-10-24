"""The roads of Saltmarsh: each place, and the places one road away."""

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
