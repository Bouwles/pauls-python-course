---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud.wave: "Can you look at mine? Doubling means moving every pair, and that's O(n). So mine doesn't."
  - yahya.unimpressed: "Five things in, and three of them have vanished. Very quickly, but still."
dialogue_after:
  - yahya.thinking: "The pile number changes when the piles do. So the moving isn't optional. Fine."
hints:
  nudge: "Before the doubling, `folders` was in pile 2 of 4. Which pile does `get` look in once there are 8?"
  plan:
    - Run it and see which counts come back as None
    - Work out where get looks for one of them, and where it really is
    - When the piles double, move every pair to the pile it belongs in now
  shape: |
    if self.count > 0.75 * len(self.piles):
        old_piles = self.piles
        self.piles = [[] for _ in range(___)]
        for old_pile in old_piles:
            for pair in old_pile:
                self._pile(___).append(pair)
---
Yahya counts the Archive's stationery with a hash map of his own. His doubling puts the new piles on the end and leaves every pair where it was.

Run it. Then fix the doubling, so every pair moves to the pile its hash picks now.
