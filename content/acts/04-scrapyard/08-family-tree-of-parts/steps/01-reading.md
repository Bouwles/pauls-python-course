---
id: reading
type: reading
title: The family tree
---
A **tree** is a card with cards below it, and those cards have cards below them. The top card is the **root**; a card with nothing below it is a **leaf**. The tree's **height** is how many levels it has, from the root down to the deepest leaf.

Neil's rocket catalogue is a **binary search tree**. Each card has at most two cards just below it, and everything down its left side has a smaller number, everything down its right side a bigger one.

```text
                500 nose cone
              /               \
       250 fin set         750 launch rail
        /         \                \
  101 body tube   342 parachute   977 launch pad
```

To find 342: smaller than 500, go left; bigger than 250, go right; there. Each look rules out a whole side, as binary search did on the bolt drawers. Adding a card is the same walk, until it steps off the bottom: the new card goes there.

Every side of a tree is a smaller tree, so most tree code is recursive.
