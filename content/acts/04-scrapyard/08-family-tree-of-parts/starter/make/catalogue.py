"""The family tree of parts: Neil's rocket catalogue, as a binary search tree."""

# Card: each card knows its own thing and the two cards below it
#
# Catalogue:
#     add: an empty tree: the new card is the root
#          walk down from the root: already filed? Replace the name
#          smaller goes left, bigger goes right, until a place is empty
#     find: the same walk, counting every look
#     helpers that take a card: an empty side is the base case
#         in order: left side, the card, then the right side
#         height: one more than the taller side
#     pre_order, post_order, len and between

# Neil's rocket catalogue cards, in the order he filed them. Every card
# knows which side of its parent it belongs on, and why: smaller, or bigger.
ROCKET_CARDS = [
    (500, "nose cone"), (250, "fin set"), (750, "launch rail"), (101, "body tube"),
    (342, "parachute"), (621, "motor mount"), (977, "launch pad"), (188, "centering ring"),
    (377, "shock cord"), (430, "altimeter"), (702, "launch lug"), (850, "igniter"),
    (133, "coupler"), (555, "nose weight"), (915, "launch controller"),
]
