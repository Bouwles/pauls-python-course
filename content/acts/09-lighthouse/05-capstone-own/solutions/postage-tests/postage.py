"""Postage for Riya's prints, as she wrote it down for her shop's website. Prices are in pence.

postage(weight, destination)
        weight in grams; destination "local" (anywhere in the city) or "away"
        local: 60 up to and including 100 g, 90 up to and including 500 g,
               150 up to and including 2000 g
        away:  twice the local price
        A weight of 0 g or less, a weight over 2000 g, or any other
        destination: ValueError. The shop doesn't post parcels over 2 kg.
"""


def postage(weight, destination):
    if destination not in ("local", "away"):
        raise ValueError(f"The shop sends things local or away, not {destination!r}.")
    if weight <= 0 or weight > 2000:
        raise ValueError("The shop takes parcels from 1 g to 2 kg.")
    if weight <= 100:
        price = 60
    elif weight <= 500:
        price = 90
    else:
        price = 150
    return price * 2 if destination == "away" else price
