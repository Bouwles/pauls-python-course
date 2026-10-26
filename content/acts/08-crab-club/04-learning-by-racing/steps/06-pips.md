---
id: pips
type: pips
title: Pip's Version
files: [track.py, main.py]
entry: main.py
dialogue:
  - pip: "TD(0). I move him on first, so I never forget to. Then the update."
  - pip: "The finish comes out worth ten. Every other tile is a disaster. He's a pessimist."
dialogue_after:
  - pip: "So I was updating the tile he'd landed on, with its own worth as the target. The finish learned to love itself."
hints:
  nudge: "When the update line runs, which tile does `tile` name: the one he left, or the one he landed on?"
  plan:
    - Run it and look at the finish and the pool
    - Follow one step by hand, writing down what `tile` holds on each line
    - Update the tile he left, then move him on
  shape: |
    after, reward, over = step(tile, policy[tile], rng)
    target = reward + (0 if over else gamma * values[after])
    values[___] += alpha * (target - values[___])
    tile = ___
---
Pip's TD(0) learns the traditional line from 2000 races. `track.py` is Moss's grid.

The finish and the pool end the race, so nothing follows them: their worth should stay 0. Run it and look at the right-hand column. Then fix it.
