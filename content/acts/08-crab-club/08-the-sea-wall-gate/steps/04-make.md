---
id: make
type: make
title: Make the grid Gymnasium-shaped
files: [gridenv.py]
entry: gridenv.py
on_pass: { committee: "The same grid, in the agreed shape. We approve of agreed shapes." }
hints:
  nudge: "What does the grid have to remember between one call to step and the next, and which of those does reset put back?"
  plan:
    - "reset: a new generator only if given a seed; back to the start, no steps taken"
    - "Apply the action: slip sideways with chance self.slip"
    - "Let the world move: off the edge or into the rock, he stays put"
    - "Was that safe? The reward, terminated on the finish or the pool, truncated at max_steps"
    - "Hand back five things: the tile number, a float, two bools, and the info"
    - "run_episode: reset with the seed, then step until terminated or truncated"
  shape: |
    def reset(self, seed=None, options=None):
        if seed is not None:
            self.rng = ___
        self.tile = START
        self.steps = 0
        return self.tile[0] * 4 + self.tile[1], {}


    def step(self, action):
        slipped = bool(self.rng.random() < self.slip)
        ...
        terminated = mark in "FP"
        truncated = ___ and self.steps >= self.max_steps
        return ___, reward, terminated, truncated, {"slipped": slipped}
---
Gymnasium doesn't run in the workshop, but its shape does. Write the old racing grid as a class with `reset` and `step`, exactly as Gymnasium would want them: Moss's ballast tanks, without the import.

The observation is the tile number, `row * 4 + col`, so a learner can use it to index a table. Rewards are floats. `info` says whether he slipped.

One Gymnasium habit to copy: `reset(seed=5)` makes a fresh generator from the seed, but `reset()` with no seed keeps the generator it has. So one seed at the start repeats a whole run of races.

The checks race on grids with no slipping and with nothing but slipping, and compare runs from the same seed.
