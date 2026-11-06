---
id: make
type: make
title: Make REINFORCE
files: [track.py, reinforce.py]
entry: reinforce.py
timeout_ms: 20000
on_pass: { aaesha.pleased: "No table, no network, no values. It just knows what to do. That's what I wanted." }
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
Write the six functions of the brief in `reinforce.py`. Paul has written two helpers in it already: `spread`, for how much estimates disagree, and `average_returns`, a baseline measured from races.

- `chances` and `grad_log_chance`: the softmax, and 1 for the move made minus the chances, on that tile only.
- `race` and `returns_to_go`: one race, moves drawn with `rng.choice(4, p=...)`, and the backwards trick.
- `reinforce_gradient`: each move's return to go, less the baseline if there is one, times its gradient; added up and averaged over the races.
- `train`: a race and a step uphill per episode, the baseline nudged 0.1 of the way towards each return.

Done, it prints a smaller spread with a baseline, and a trained policy worth about 1 a race. The checks work out REINFORCE by hand, measure your gradients by nudging, then train for 300 races.
