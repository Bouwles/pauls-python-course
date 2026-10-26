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
    # While there's anywhere left to look
    #     Look in the middle
    #     Found it: say where
    #     Too early: throw away the middle and everything before it
    #     Too late: throw away the middle and everything after it
    # Nowhere left: say so


def starting_with(parts, prefix):
    """Every name that starts with prefix, in order, without walking the whole list."""


def containing(parts, word):
    """(names, looks): every name with word anywhere in it, in order. It has to look at all of them."""


def add_part(parts, name):
    """Put name into the list in its place, unless it's there already. Returns its position."""


def how_many(count):
    """1 part, 2 parts."""
    if count == 1:
        return "1 part"
    return f"{count} parts"


def search(parts, query):
    """The answer to one query, as one line of text."""


if __name__ == "__main__":
    parts = load_parts(PARTS_FILE)
    print(f"Parts list: {len(parts)} parts, {parts[0]} to {parts[-1]}")
    print("A name, the start of one with *, or +name to add one. Blank to stop.")
    while True:
        query = input("Search? ").strip()
        if not query:
            break
        print(search(parts, query))
