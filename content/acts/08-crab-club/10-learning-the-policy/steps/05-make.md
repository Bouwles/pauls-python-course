---
id: make
type: make
title: Make REINFORCE
files: [track.py, reinforce.py]
entry: reinforce.py
timeout_ms: 20000
on_pass: { riya: "No table, no network, no values. It just knows what to do. That's what I wanted." }
hints:
  nudge: "`reinforce_gradient` needs, for every move of every race, two things: the return from that move on, and the gradient of the log of its chance. Which functions give you those?"
  plan:
    - "chances: take away the biggest preference, exp, divide by the total"
    - "grad_log_chance: zeros, then minus the chances on the tile, plus 1 for the move made"
    - "race: from the start, pick by chance with rng.choice(4, p=...), until the race is over or the limit"
    - "returns_to_go: backwards through the rewards, as in the Gridworld Simulator"
    - "reinforce_gradient: credit each move with the rewards after it, score it against the baseline, average over races"
    - "train: a race, a nudge uphill, the baseline 0.1 of the way towards each return"
  shape: |
    def reinforce_gradient(theta, races, gamma=0.9, baseline=None):
        grad = np.zeros_like(theta)
        for moves in races:
            later = returns_to_go([reward for _, _, reward in moves], gamma)
            for (tile, action, _), ret in zip(moves, later):
                score = ret if baseline is None else ___
                grad += score * ___
        return grad / ___
---
Write `reinforce.py`. Paul has added two helpers: `spread`, for how much estimates disagree, and `average_returns`, a baseline measured from races, as in the Value Estimator.

The baseline in `train` is a `(3, 4)` array, a number for each tile. After each race, move each tile's number 0.1 of the way towards each return that followed it.

Train with `watch=True` and press Run: after every race the output panel tints each tile by its baseline and draws the crab's most likely move, and pointing at a tile shows the four chances. The checks ignore drawings.

The checks work out REINFORCE by hand on a fixed batch of races, measure your gradients by nudging, compare spreads with and without a baseline, then train for 300 races and work out exactly what its policy is worth.
