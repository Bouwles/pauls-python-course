"""The family tree of parts: the clockmaker's catalogue, as a binary search tree."""

# The clockmaker's catalogue cards, in the order they were filed. Every card
# knows which side of its parent it belongs on, and why: smaller, or bigger.
CLOCKMAKERS_CARDS = [
    (500, "anchor chain"), (250, "bike bell"), (750, "tin bath"), (101, "bolt tin"),
    (342, "brass valve"), (621, "mangle roller"), (977, "winch handle"), (188, "clock spring"),
    (377, "brass bell"), (430, "lamp lens"), (702, "pram wheel"), (850, "kettle element"),
    (133, "gear wheel"), (555, "hubcap"), (915, "spring coil"),
]
