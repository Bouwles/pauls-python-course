"""The Makerspace scale: parts lightest first, and finding a weight in a sorted pile."""

BOX = [("monitor", 4), ("power-supply", 2), ("speaker", 4), ("mouse", 1), ("router", 2)]


def merge(left, right):
    """Two piles sorted by weight, as one. On a tie, left comes first."""
    merged = []
    next_left = 0
    next_right = 0
    while next_left < len(left) and next_right < len(right):
        if left[next_left][1] <= right[next_right][1]:
            merged.append(left[next_left])
            next_left += 1
        else:
            merged.append(right[next_right])
            next_right += 1
    merged.extend(left[next_left:])
    merged.extend(right[next_right:])
    return merged


def sort_parts(parts):
    """A new list, lightest first; parts of the same weight keep their order."""
    if len(parts) <= 1:
        return list(parts)
    middle = len(parts) // 2
    return merge(sort_parts(parts[:middle]), sort_parts(parts[middle:]))


def first_at_least(parts, kg):
    """The position of the first part weighing at least kg, or len(parts)."""
    low = 0
    high = len(parts)
    while low < high:
        middle = (low + high) // 2
        if parts[middle][1] < kg:
            low = middle + 1
        else:
            high = middle
    return low


if __name__ == "__main__":
    pile = sort_parts(BOX)
    print(pile)
    print(f"First at 3 kg or more: position {first_at_least(pile, 3)}")
