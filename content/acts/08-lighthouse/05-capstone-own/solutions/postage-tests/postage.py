"""Mira's postage, as the post office charges it. Prices are in pence.

postage(weight, destination)
        weight in grams; destination "local" (anywhere in Saltmarsh) or "away"
        local: 60 up to and including 100 g, 90 up to and including 500 g,
               150 up to and including 2000 g
        away:  twice the local price
        A weight of 0 g or less, a weight over 2000 g, or any other
        destination: ValueError. Mira doesn't take parcels over 2 kg.
"""
# Penhallow wrote this for Mira years ago. Mira kept the printout in the
# lighthouse's tool cupboard, with a note on the back:
# The last project I chose for myself is at the top of this lighthouse. It
# began as one small slice, with tests, the way Moss taught me. Somewhere
# along the way I stopped writing them. Tom has the key. A.P.


def postage(weight, destination):
    if destination not in ("local", "away"):
        raise ValueError(f"Mira sends things local or away, not {destination!r}.")
    if weight <= 0 or weight > 2000:
        raise ValueError("Mira takes parcels from 1 g to 2 kg.")
    if weight <= 100:
        price = 60
    elif weight <= 500:
        price = 90
    else:
        price = 150
    return price * 2 if destination == "away" else price
