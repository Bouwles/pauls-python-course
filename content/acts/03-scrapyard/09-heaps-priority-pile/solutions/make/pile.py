"""Nell's priority pile: a heap built by hand, smallest on top."""

DAY_FILE = "day.txt"


def push(heap, item):
    """Add item to the heap, keeping the smallest at heap[0]."""
    # Put it at the bottom
    heap.append(item)
    position = len(heap) - 1
    # While it isn't at the top
    while position > 0:
        # Find its parent
        parent = (position - 1) // 2
        # If the parent is no bigger, stop
        if heap[parent] <= heap[position]:
            break
        # Otherwise swap them, and climb
        heap[position], heap[parent] = heap[parent], heap[position]
        position = parent


def pop(heap):
    """Remove and return the smallest item. IndexError if the heap is empty."""
    # Keep the top to hand back
    smallest = heap[0]
    # Move the last item up into its place
    last = heap.pop()
    if heap:
        heap[0] = last
        position = 0
        # While it has a child smaller than itself
        while True:
            smaller = position
            for child in (2 * position + 1, 2 * position + 2):
                if child < len(heap) and heap[child] < heap[smaller]:
                    smaller = child
            if smaller == position:
                break
            # Swap it with the smaller child, and sink
            heap[position], heap[smaller] = heap[smaller], heap[position]
            position = smaller
    return smallest


class RepairPile:
    """Repairs waiting at the yard: lowest priority number first, then first come."""

    def __init__(self):
        self.waiting = []
        self.arrived = 0

    def add(self, repair, priority):
        push(self.waiting, (priority, self.arrived, repair))
        self.arrived = self.arrived + 1

    def take(self):
        priority, arrival, repair = pop(self.waiting)
        return repair

    def __len__(self):
        return len(self.waiting)


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
