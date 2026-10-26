"""Search engine for Nell's parts list: whole names, beginnings, and words anywhere."""
import bisect

PARTS_FILE = "parts.txt"


def load_parts(path):
    """Penhallow's parts book: one name a line, kept in alphabetical order."""
    with open(path) as book:
        return sorted(line.strip() for line in book if line.strip())


def find_part(parts, name):
    """(position, looks): where name is in the sorted list, or -1, and how many names were looked at."""
    # Mark the first and last place it could be
    low = 0
    high = len(parts) - 1
    looks = 0
    # While there's anywhere left to look
    while low <= high:
        # Look in the middle
        middle = (low + high) // 2
        looks = looks + 1
        # Found it: say where
        if parts[middle] == name:
            return middle, looks
        # Too early: throw away the middle and everything before it
        if parts[middle] < name:
            low = middle + 1
        # Too late: throw away the middle and everything after it
        else:
            high = middle - 1
    # Nowhere left: say so
    return -1, looks


def starting_with(parts, prefix):
    """Every name that starts with prefix, in order, without walking the whole list."""
    position = bisect.bisect_left(parts, prefix)
    found = []
    while position < len(parts) and parts[position].startswith(prefix):
        found.append(parts[position])
        position = position + 1
    return found


def containing(parts, word):
    """(names, looks): every name with word anywhere in it, in order. It has to look at all of them."""
    found = []
    looks = 0
    for name in parts:
        looks = looks + 1
        if word in name:
            found.append(name)
    return found, looks


def add_part(parts, name):
    """Put name into the list in its place, unless it's there already. Returns its position."""
    position = bisect.bisect_left(parts, name)
    if position == len(parts) or parts[position] != name:
        parts.insert(position, name)
    return position


def how_many(count):
    """1 part, 2 parts."""
    if count == 1:
        return "1 part"
    return f"{count} parts"


def search(parts, query):
    """The answer to one query, as one line of text."""
    if query.startswith("+"):
        name = query[1:]
        before = len(parts)
        position = add_part(parts, name)
        if len(parts) == before:
            return f"{name}: already part {position}"
        return f"{name}: added as part {position}"
    if query.endswith("*"):
        prefix = query[:-1]
        found = starting_with(parts, prefix)
        if not found:
            return f"{query}: no parts"
        return f"{query}: {how_many(len(found))}: {', '.join(found)}"
    position, looks = find_part(parts, query)
    if position >= 0:
        return f"{query}: part {position}, found in {looks} looks"
    found, looks = containing(parts, query)
    if not found:
        return f"{query}: no part by that name, and none with it in the name ({looks} looks)"
    return f"{query}: no part by that name. {how_many(len(found))} with it in the name ({looks} looks): {', '.join(found)}"


if __name__ == "__main__":
    parts = load_parts(PARTS_FILE)
    print(f"Parts list: {len(parts)} parts, {parts[0]} to {parts[-1]}")
    print("A name, the start of one with *, or +name to add one. Blank to stop.")
    while True:
        query = input("Search? ").strip()
        if not query:
            break
        print(search(parts, query))
