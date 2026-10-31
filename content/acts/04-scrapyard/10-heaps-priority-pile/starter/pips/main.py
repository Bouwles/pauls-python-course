"""Riya's task scheduler for the Makerspace: the most urgent repair first."""
import heapq


class TaskScheduler:
    """Repairs waiting at the bench. Priority 1 is the most urgent."""

    def __init__(self):
        self.waiting = []

    def add(self, repair, priority):
        heapq.heappush(self.waiting, (priority, repair))

    def take(self):
        priority, repair = heapq.heappop(self.waiting)
        return repair

    def __len__(self):
        return len(self.waiting)


if __name__ == "__main__":
    pile = TaskScheduler()
    pile.add("Riya's headphones", 3)
    pile.add("Paul's desk lamp", 3)
    pile.add("the arcade cabinet", 1)
    while len(pile) > 0:
        print(f"Mending {pile.take()}")
