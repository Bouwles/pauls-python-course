"""Saturday's bake sale orders."""
import copy

STANDING = {
    "Paul": {"bread": 3, "buns": 4},
    "The Studio": {"bread": 6, "lardy cake": 2},
}


def saturday_orders(standing, extras):
    """Return Saturday's orders: the standing orders plus the extras.

    Changes neither argument.
    """
    # Copy before you change, all the way down
    orders = copy.deepcopy(standing)
    # Add each customer's extras to the copy
    for customer, items in extras.items():
        if customer not in orders:
            orders[customer] = {}
        for item, quantity in items.items():
            orders[customer][item] = orders[customer].get(item, 0) + quantity
    # Hand back the copy
    return orders


if __name__ == "__main__":
    extras = {"Paul": {"buns": 2}, "Yahya": {"lardy cake": 1}}
    for customer, order in saturday_orders(STANDING, extras).items():
        print(customer, order)
    print("Standing:", STANDING)
