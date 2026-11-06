---
id: make
type: make
title: Make the grid Gymnasium-shaped
files: [gridenv.py]
entry: gridenv.py
on_pass: { aaesha.pleased.thumbs: "The same grid, in the agreed shape. Any agent can race it now." }
hints:
  nudge: "What does the grid have to remember between one call to step and the next, and which of those does reset put back?"
  plan:
    - "reset: a new generator only if given a seed; back to the start, no steps taken"
    - "Apply the action: slip sideways with chance self.slip"
    - "Let the world move: off the edge or into the rock, it stays put"
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
Write the old racing grid as a Gymnasium-shaped class, `RacingGrid`, in `gridenv.py`: Neil's drone without the import.

- `reset(seed=None)`: a fresh generator only when given a seed; back to the start, no steps taken. Return the observation and `{}`.
- `step(action)`: slip sideways with chance `self.slip`, move, and return the five things. Rewards are floats. `terminated` on the finish or the pool; `truncated` when `max_steps` is reached first. `info` is `{"slipped": ...}`.
- `run_episode(env, policy, seed=None)`: reset, then step until either flag. Return the total reward and the number of steps.

The observation is the tile number, `row * 4 + col`, so a learner can index a table with it.

Done, it prints random moves against the best line, and the best line wins easily. The checks race on grids with no slipping and with nothing but slipping, and compare runs from the same seed.
