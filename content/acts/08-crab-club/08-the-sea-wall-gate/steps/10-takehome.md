---
id: gate
type: takehome
title: Tide Gate, at home
python: "3.10"
requirements: [gymnasium, numpy]
heavy: true
setup: |
  Gymnasium installs with pip like anything else; `pip install -r requirements.txt` fetches it with NumPy. Nothing here needs a screen or a graphics card. The agent's tests train a keeper twice, which takes about twenty seconds, so let pytest finish.
dialogue:
  - caitlin.pleased.point: "Here's the game, rules and all. Aaesha wrote the tests before Riya had finished the art."
  - aaesha.neutral: "Fifteen for the gate, five for the keeper. Read them before you run them."
---
`gate_env.py` is the gate as a real Gymnasium environment. Its docstring has Caitlin's rules: how the gate moves, how the river and the tide move the harbour, when it's safe, and what to draw from `self.np_random` at reset. The comments in each method are the labels from Neil's drone. Fifteen tests check it: the spaces, Gymnasium's own `check_env`, the same seed giving the same tides, and every rule.

`agent.py` is the keeper: tabular Q-learning on the four readings cut into bins, with Paul's suggested edges. Start every Q-value at `1 / (1 - gamma)`, the most a keeper could ever earn, so every untried move looks good until it's tried. `make_agent(seed)` hands back a keeper with an `act(observation)` method. Done, all twenty tests pass: the keeper averages at least 150 safe quarter hours out of 200 on twenty tides it never trained on, where doing nothing manages about 35.

```console
(.venv) $ pytest tests/test_env.py -x
(.venv) $ python agent.py
```
