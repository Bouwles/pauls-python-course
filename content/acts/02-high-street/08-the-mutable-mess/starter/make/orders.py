"""Bea's Saturday orders."""
import copy

STANDING = {
    "Ashby": {"bread": 3, "buns": 4},
    "Drowned Anchor": {"bread": 6, "lardy cake": 2},
}


def saturday_orders(standing, extras):
    """Return Saturday's orders: the standing orders plus the extras.

    Changes neither argument.
    """
    # Copy before you change, all the way down
    # Add each customer's extras to the copy
    # Hand back the copy


if __name__ == "__main__":
    extras = {"Ashby": {"buns": 2}, "Mira": {"lardy cake": 1}}
    for customer, order in saturday_orders(STANDING, extras).items():
        print(customer, order)
    print("Standing:", STANDING)
