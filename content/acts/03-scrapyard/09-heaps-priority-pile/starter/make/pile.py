"""Nell's priority pile: a heap built by hand, smallest on top."""

DAY_FILE = "day.txt"


def push(heap, item):
    """Add item to the heap, keeping the smallest at heap[0]."""
    # Put it at the bottom
    # While it isn't at the top
    #     Find its parent
    #     If the parent is no bigger, stop
    #     Otherwise swap them, and climb


def pop(heap):
    """Remove and return the smallest item. IndexError if the heap is empty."""
    # Keep the top to hand back
    # Move the last item up into its place
    # While it has a child smaller than itself
    #     Swap it with the smaller child, and sink


class RepairPile:
    """Repairs waiting at the yard: lowest priority number first, then first come."""


if __name__ == "__main__":
    pile = RepairPile()
    with open(DAY_FILE) as day:
        for line in day:
            words = line.strip().split(maxsplit=2)
            if not words:
                continue
            if words[0] == "add":
                pile.add(words[2], int(words[1]))
            elif words[0] == "take":
                print(f"Mending {pile.take()}")
    print(f"Still waiting: {len(pile)}")
