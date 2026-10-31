---
id: make-whiteboard
type: make
title: Paul's whiteboard
files: [whiteboard.py]
entry: whiteboard.py
dialogue:
  - paul: "One day someone will hand you a pen and ten minutes. Three questions. Everything you need is on this floor."
on_pass: { paul: "A dictionary, a queue and a heap. Ten minutes each, and you'd have time to spare." }
hints:
  nudge: "For `pair_for`, when you reach a weight, what would you need to know about the weights before it to answer straight away?"
  plan:
    - "pair_for: a dictionary of each weight seen so far and where; for each weight, look up its partner, then remember the weight"
    - "islands: go through every tile; each # tile not yet visited starts a new island"
    - Visit the whole island from there with a queue, as in the maze solver, marking each tile as you queue it
    - "merge_piles: a heap holding the lightest weight not yet taken from each pile, with which pile and where"
    - Take the lightest, and put the next weight from its pile in its place
  shape: |
    def pair_for(weights, target):
        seen = {}
        for position, weight in enumerate(weights):
            if ___ in seen:
                return seen[___], position
            seen[weight] = ___
        return None
---
Three short questions in `whiteboard.py`, each from an earlier project. None needs more than a dozen lines.

`pair_for` is the hash map's trick: a dictionary answers "have I seen its partner?" without walking back along the list.

`islands` is the maze solver again. Each tile's neighbours are the four tiles round it, and a search from one `#` tile visits its whole island.

`merge_piles` is the merge from the Sorting Visualiser, for any number of piles: a heap always knows which pile has the lightest weight at its front.

The hidden checks hand `pair_for` twenty thousand parts that count every look, and try grids that are empty, all `#`, and joined only at the corners.
