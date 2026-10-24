"""The weighbridge desk at Nell's gate: a queue of lorries, and an undo button."""
from collections import deque


class Weighbridge:
    """Lorries queue at the gate and are weighed in turn; a weighing can be taken back."""

    def __init__(self):
        self.queue = deque()      # front on the left, back on the right
        self.weighings = []       # undo stack of (lorry, kilos), latest on top
        self.total = 0

    def arrive(self, lorry):
        self.queue.append(lorry)

    def waiting(self):
        return list(self.queue)

    def weigh(self, kilos):
        if not self.queue:
            return None
        lorry = self.queue.popleft()
        self.total = self.total + kilos
        self.weighings.append((lorry, kilos))
        return lorry

    def undo(self):
        if not self.weighings:
            return None
        lorry, kilos = self.weighings.pop()
        self.total = self.total - kilos
        self.queue.appendleft(lorry)
        return lorry


if __name__ == "__main__":
    bridge = Weighbridge()
    for lorry in ["flatbed", "tipper", "council van"]:
        bridge.arrive(lorry)
    print("Waiting:", bridge.waiting())
    print(f"Weighed {bridge.weigh(1200)}: 1200 kg")
    print(f"Weighed {bridge.weigh(3400)}: 3400 kg")
    print(f"Undo: {bridge.undo()} goes back to the front")
    print("Waiting:", bridge.waiting())
    print(f"Total: {bridge.total} kg")
