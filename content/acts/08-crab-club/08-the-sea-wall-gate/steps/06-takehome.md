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
The project has two files to finish and twenty tests.

`gate_env.py` is the gate as a Gymnasium environment. Its docstring has Caitlin's rules: how the gate moves, how the river and the tide move the harbour, when it's safe, and what to draw from `self.np_random` at reset. The comments in each method are Paul's subgoal labels. Fifteen tests check it: the spaces, Gymnasium's own `check_env`, the same seed giving the same tides, and every rule.

`agent.py` is the keeper. Train a tabular Q-learner on the four numbers cut into bins (Paul suggests some), and hand it back from `make_agent(seed)` with an `act(observation)` method. Five tests check it against `do_nothing` on twenty tides it never trained on: it must average 150 safe quarter hours out of 200.

```console
(.venv) $ pytest tests/test_env.py -x
(.venv) $ python agent.py
```
