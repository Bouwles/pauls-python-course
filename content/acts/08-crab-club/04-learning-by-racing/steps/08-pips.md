---
id: pips
type: pips
title: Fix Caitlin's version
files: [track.py, main.py]
entry: main.py
dialogue:
  - caitlin.neutral: "Can you look at mine? TD(0). I move the crab on first, so the screen keeps up. Then the update."
  - caitlin.confused: "The finish comes out worth ten. Every other tile is a disaster. It's a pessimist."
dialogue_after:
  - caitlin.laughing: "So I was updating the tile it landed on, with its own worth as the target. The finish learned to love itself."
hints:
  nudge: "When the update line runs, which tile does `tile` name: the one the crab left, or the one it landed on?"
  plan:
    - Run it and look at the finish and the pool
    - Follow one step by hand, writing down what `tile` holds on each line
    - Update the tile it left, then move it on
  shape: |
    after, reward, over = step(tile, policy[tile], rng)
    target = reward + (0 if over else gamma * values[after])
    values[___] += alpha * (target - values[___])
    tile = ___
---
Caitlin's TD(0) learns the traditional line from 2000 races. `track.py` is Paul's grid.

The finish and the pool end the race, so nothing follows them: their values should stay at 0, and the other tiles should come out near the map's. Run it and look at the right-hand column.
