---
id: pips-forward
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "Can you look at mine? Two layers, one line each. Done before Neil found his coffee."
  - caitlin: "NumPy's max is broken. It wants an axis. I gave it a zero."
dialogue_after:
  - caitlin: "So max finds the biggest thing in one array, and maximum compares two. Different words. Fair enough."
  - caitlin: "And a sigmoid of 2. I should have noticed. Nothing is 2 likely."
hints:
  nudge: "What does `np.max` do with one array? What do you need instead: the biggest entry, or 0 and each entry compared?"
  plan:
    - Read the traceback and find which activation it points at
    - Compare 0 with every entry, rather than finding the biggest entry
    - Run again and check every output is between 0 and 1
    - Put brackets where the sigmoid's division needs them
  shape: |
    def relu(z):
        return np.___(0, z)


    def sigmoid(z):
        return 1 / ___
---
Caitlin's network should print `0.5` for the first evening and `0.321` for the second. Run it, read the traceback and fix it.

Then run it again. There is a second bug, and it doesn't crash: a sigmoid's output is always between 0 and 1, and Caitlin's isn't.
