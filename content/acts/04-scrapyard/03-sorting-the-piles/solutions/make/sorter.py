"""Sorting Visualiser: four sorts, each one shown at work, round by round."""
import random
import time

from piles import draw, insertion_sort, selection_sort

KINDS = ["anchor-shackle", "bike-bell", "clock-spring", "gear-12t", "hubcap", "kettle-element",
         "lamp-lens", "mangle-roller", "pram-wheel", "spring-coil", "valve-brass", "winch-handle"]


def pier_lot(count, seed=1):
    """The pier's parts as (name, kg) pairs, in the order they come off the lorry."""
    lorry = random.Random(seed)
    return [(lorry.choice(KINDS), lorry.randint(1, 40)) for _ in range(count)]


def merge(left, right, key):
    """Merge two lists already sorted by key. On a tie, left comes first."""
    # Start an empty pile, and a finger at the front of each
    merged = []
    next_left = 0
    next_right = 0
    # While both piles have parts left
    while next_left < len(left) and next_right < len(right):
        # Take the lighter front part; on a tie, take from the left
        if key(left[next_left]) <= key(right[next_right]):
            merged.append(left[next_left])
            next_left = next_left + 1
        else:
            merged.append(right[next_right])
            next_right = next_right + 1
    # Tip whatever's left on the end
    merged.extend(left[next_left:])
    merged.extend(right[next_right:])
    # Hand back the merged pile
    return merged


def merge_sort(items, key=lambda item: item, frames=None):
    """A new list of items sorted by key, merging piles in pairs, round after round.

    Stable; items is left as it was. If frames is a list, every round's piles,
    laid end to end, go on it.
    """
    piles = [[item] for item in items]
    while len(piles) > 1:
        merged_piles = []
        for start in range(0, len(piles), 2):
            if start + 1 < len(piles):
                merged_piles.append(merge(piles[start], piles[start + 1], key))
            else:
                merged_piles.append(piles[start])
        piles = merged_piles
        if frames is not None:
            frames.append([item for pile in piles for item in pile])
    if piles:
        return piles[0]
    return []


def quick_sort(items, key=lambda item: item, frames=None):
    """A new list of items sorted by key, splitting piles round a pivot, round after round.

    Stable; items is left as it was. If frames is a list, every round's piles,
    laid end to end, go on it.
    """
    piles = [list(items)]
    while any(len(pile) > 1 for pile in piles):
        split_piles = []
        for pile in piles:
            if len(pile) <= 1:
                split_piles.append(pile)
                continue
            pivot = key(pile[0])
            lighter = [item for item in pile if key(item) < pivot]
            same = [item for item in pile if key(item) == pivot]
            heavier = [item for item in pile if key(item) > pivot]
            if lighter:
                split_piles.append(lighter)
            split_piles.extend([item] for item in same)
            if heavier:
                split_piles.append(heavier)
        piles = split_piles
        if frames is not None:
            frames.append([item for pile in piles for item in pile])
    return [item for pile in piles for item in pile]


def weight_of(part):
    return part[1]


def show(choice, pile):
    """Play one sort's frames, then say how many steps it took."""
    frames = []
    if choice == "selection":
        selection_sort(list(pile), frames)
    elif choice == "insertion":
        insertion_sort(list(pile), frames)
    elif choice == "merge":
        merge_sort(pile, frames=frames)
    elif choice == "quick":
        quick_sort(pile, frames=frames)
    else:
        print(f"No sort called {choice}.")
        return
    for step, frame in enumerate(frames, start=1):
        print(f"Step {step}")
        print(draw(frame))
    print(f"{choice.capitalize()} sort: {len(frames)} steps")


if __name__ == "__main__":
    pile = [7, 3, 9, 3, 1, 12, 5]
    print(draw(pile))
    show(input("Which sort: selection, insertion, merge or quick? ").strip().lower(), pile)

    lot = pier_lot(10_000)
    timings = {}
    start = time.perf_counter()
    expected = sorted(lot, key=weight_of)
    timings["sorted()"] = time.perf_counter() - start
    agreed = True
    for name, sort in [("merge", merge_sort), ("quick", quick_sort)]:
        start = time.perf_counter()
        result = sort(lot, key=weight_of)
        timings[name] = time.perf_counter() - start
        agreed = agreed and result == expected
    print(f"Pier lot: {len(lot)} parts, merge and quick agree with sorted(): {agreed}")
    print(", ".join(f"{name} {seconds:.3f} s" for name, seconds in timings.items()))
