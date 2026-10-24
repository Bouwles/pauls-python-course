"""The weighbridge desk at Nell's gate: a queue of lorries, and an undo button."""
from collections import deque


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
