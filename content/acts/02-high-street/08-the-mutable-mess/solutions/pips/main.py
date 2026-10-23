standing = {"bread": 3, "buns": 4}


def todays_order(standing, extras):
    """Return today's order: the standing order plus this week's extras."""
    order = standing.copy()
    for item, quantity in extras.items():
        order[item] = order.get(item, 0) + quantity
    return order


this_week = todays_order(standing, {"buns": 2})
next_week = todays_order(standing, {})
print("This week:", this_week)
print("Next week:", next_week)
