"""Pip's task scheduler for Nell: the most urgent repair first."""
import heapq


class TaskScheduler:
    """Repairs waiting at the yard. Priority 1 is the most urgent."""

    def __init__(self):
        self.waiting = []
        self.arrived = 0

    def add(self, repair, priority):
        heapq.heappush(self.waiting, (priority, self.arrived, repair))
        self.arrived = self.arrived + 1

    def take(self):
        priority, arrival, repair = heapq.heappop(self.waiting)
        return repair

    def __len__(self):
        return len(self.waiting)


if __name__ == "__main__":
    pile = TaskScheduler()
    pile.add("Mrs Vance's trolley", 3)
    pile.add("Mr Ashby's ladder", 3)
    pile.add("the ferry winch", 1)
    while len(pile) > 0:
        print(f"Mending {pile.take()}")
