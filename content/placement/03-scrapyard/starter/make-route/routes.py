"""The roads round the Clocktower: each place, and the places one road away."""

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
