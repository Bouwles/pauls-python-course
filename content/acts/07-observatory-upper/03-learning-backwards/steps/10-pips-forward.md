---
id: pips-forward
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.pleased: "Can you look at mine? It's two layers, one line each, and I finished before Neil had even found his coffee."
  - caitlin.confused: "I think NumPy's max is broken, because it wants an axis and I gave it a zero."
dialogue_after:
  - caitlin.laughing: "So max finds the biggest and maximum compares, and nothing's 2 likely, which I really should have noticed."
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
