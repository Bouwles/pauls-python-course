"""The clock's controller: the face lamp, the fog lamp and the hand heaters.

It was fitted before Paul had the keys. It watched three winters of the old
logs and learned to run the clock face from them. These numbers are what it
learned. Nobody ever wrote down why.
"""

LEARNED = {
    "lamp": {"dark": 10.0, "visibility_km": -1.0, "bias": 2.0},
    "fog_lamp": {"visibility_km": -10.0, "ice_mm": -1.5, "bias": 8.0},
    "heater": {"ice_mm": 6.0, "wind": 0.0, "bias": -27.6},
}


def score(weights, features):
    return weights["bias"] + sum(w * features[name] for name, w in weights.items() if name != "bias")


def decide(night):
    """night: {"dark": 0 or 1, "visibility_m": metres, "ice_mm": ice on the hands in mm, "wind": Beaufort force}.

    Returns {"lamp": bool, "fog_lamp": bool, "heater": bool}: the face lit, the fog lamp on, the hands heated.
    """
    features = {
        "dark": night["dark"],
        "visibility_km": night["visibility_m"] / 1000,
        "ice_mm": night["ice_mm"],
        "wind": night["wind"],
    }
    return {name: score(weights, features) > 0 for name, weights in LEARNED.items()}
