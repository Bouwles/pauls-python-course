def show(items):
    if len(items) == 0:
        return "none"
    return ", ".join(sorted(items))


def lower_set(items):
    result = set()
    for item in items:
        result.add(item.lower())
    return result


def report(found, reported):
    found = lower_set(found)
    reported = lower_set(reported)
    print(f"Handed in: {len(found)} different items")
    print("Matched:", show(found & reported))
    print("Nobody has asked about:", show(found - reported))
    print("Still missing:", show(reported - found))
