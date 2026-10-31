import time


def spares(parts):
    """The names that appear more than once, in alphabetical order."""
    seen = set()
    found = set()
    for part in parts:
        if part in seen:
            found.add(part)
        else:
            seen.add(part)
    return sorted(found)


if __name__ == "__main__":
    lot = [f"part-{number}" for number in range(20_000)] + ["part-42"]
    start = time.perf_counter()
    print(spares(lot))
    print(f"{len(lot)} parts took {time.perf_counter() - start:.2f} s")
