# Aaesha's parcel run. One label per parcel in the pile by the door.
parcels = [
    "Caitlin: 2.5",
    "Yahya: 0.4",
    "Caitlin: 0.8",
    "Neil: 31",
    "Aaesha: 6",
]


def postage(kg):
    """The price of one parcel in pounds, or None if it goes by courier."""
    if kg <= 1:
        return 1.20
    elif kg <= 5:
        return 3.50
    elif kg <= 20:
        return 6.00
    return None


def tally(parcels):
    """Each name, and the list of their parcels' prices. Courier parcels are left out."""
    prices = {}
    for label in parcels:
        name, kg = label.split(":")
        price = postage(float(kg))
        if price is None:
            continue
        name = name.strip()
        if name not in prices:
            prices[name] = []
        prices[name].append(price)
    return prices


def main():
    prices = tally(parcels)
    if len(prices) == 0:
        print("Nothing to post.")
        return
    total = 0
    for name in sorted(prices):
        owed = sum(prices[name])
        count = len(prices[name])
        if count == 1:
            print(f"{name}: 1 parcel, £{owed:.2f}")
        else:
            print(f"{name}: {count} parcels, £{owed:.2f}")
        total = total + owed
    print(f"Total: £{total:.2f}")


if __name__ == "__main__":
    main()
