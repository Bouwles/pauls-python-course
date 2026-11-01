"""Riya's task scheduler for Neil's pit crew: the most urgent job first."""
import heapq


class TaskScheduler:
    """Pit jobs waiting for the crew. Priority 1 is the most urgent."""

    def __init__(self):
        self.waiting = []
        self.arrived = 0

    def add(self, job, priority):
        heapq.heappush(self.waiting, (priority, self.arrived, job))
        self.arrived = self.arrived + 1

    def take(self):
        priority, arrival, job = heapq.heappop(self.waiting)
        return job

    def __len__(self):
        return len(self.waiting)


if __name__ == "__main__":
    pile = TaskScheduler()
    pile.add("the tyre pressures", 3)
    pile.add("the chain tension", 3)
    pile.add("the loose steering bolt", 1)
    while len(pile) > 0:
        print(f"Fixing {pile.take()}")
