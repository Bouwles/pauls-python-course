"""The machine on the hill. A. Penhallow.

Six winters it watched me run the lamp, the fog horn and the sea wall gate,
and learned to do it. These numbers are what it learned. I never wrote down why.
"""

LEARNED = {
    "lamp": {"dark": 10.0, "visibility_km": -1.0, "bias": 2.0},
    "horn": {"visibility_km": -10.0, "tide_m": -1.5, "bias": 8.0},
    "gate": {"tide_m": 6.0, "wind": 0.0, "bias": -27.6},
}


def score(weights, features):
    return weights["bias"] + sum(w * features[name] for name, w in weights.items() if name != "bias")


def decide(night):
    """night: {"dark": 0 or 1, "visibility_m": metres, "tide_m": metres, "wind": Beaufort force}.

    Returns {"lamp": bool, "horn": bool, "gate": bool}: the lamp lit, the horn sounding, the gate shut.
    """
    features = {
        "dark": night["dark"],
        "visibility_km": night["visibility_m"] / 1000,
        "tide_m": night["tide_m"],
        "wind": night["wind"],
    }
    return {name: score(weights, features) > 0 for name, weights in LEARNED.items()}
