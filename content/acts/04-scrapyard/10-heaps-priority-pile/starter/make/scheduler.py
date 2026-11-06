"""Task scheduler for Neil's pit jobs on race day: a heap built by hand, the most urgent on top."""

DAY_FILE = "day.txt"


def push(heap, item):
    """Add item to the heap, keeping the smallest at heap[0]."""
    # Put it at the bottom
    # While it isn't at the top, find its parent
    #     If the parent belongs above it, stop
    #     Otherwise swap them, and climb


def pop(heap):
    """Remove and return the smallest item. IndexError if the heap is empty."""
    # Keep the top to hand back
    # Move the last item up into its place
    # While a child belongs above it, swap it with the one that belongs highest, and sink


class TaskScheduler:
    """Pit jobs waiting for the crew: lowest priority number first, then first come."""


if __name__ == "__main__":
    scheduler = TaskScheduler()
    with open(DAY_FILE) as day:
        for line in day:
            words = line.strip().split(maxsplit=2)
            if not words:
                continue
            if words[0] == "add":
                scheduler.add(words[2], int(words[1]))
            elif words[0] == "take":
                print(f"Fixing {scheduler.take()}")
    print(f"Still waiting: {len(scheduler)}")
