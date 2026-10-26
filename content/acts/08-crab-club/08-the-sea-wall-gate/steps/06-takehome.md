---
id: gate
type: takehome
title: The sea wall gate, at home
python: "3.10"
requirements: [gymnasium, numpy]
heavy: true
setup: |
  Gymnasium installs with pip like anything else; `pip install -r requirements.txt` fetches it with NumPy. Nothing here needs a screen or a graphics card. The agent's tests train a keeper twice, which takes about twenty seconds, so let pytest finish.
dialogue:
  - committee: "The club has kept the sea wall gate since 1890. It is in the constitution."
  - committee: "Article nine. For the last twenty years it has been worked from the hill..."
  - committee: "...by something nobody has explained to us. We should like a keeper we can question."
---
The project has two files to finish and twenty tests.

`gate_env.py` is the gate as a Gymnasium environment. Its docstring has the committee's rules: how the gate moves, how the river and the tide move the harbour, when it's safe, and what to draw from `self.np_random` at reset. The comments in each method are Moss's subgoal labels. Fifteen tests check it: the spaces, Gymnasium's own `check_env`, the same seed giving the same tides, and every rule.

`agent.py` is the keeper. Train a tabular Q-learner on the four numbers cut into bins (Moss suggests some), and hand it back from `make_agent(seed)` with an `act(observation)` method. Five tests check it against `do_nothing` on twenty tides it never trained on: it must average 150 safe quarter hours out of 200.

```console
(.venv) $ pytest tests/test_env.py -x
(.venv) $ python agent.py
```
