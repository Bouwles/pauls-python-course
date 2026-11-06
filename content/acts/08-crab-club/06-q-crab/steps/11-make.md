---
id: make
type: make
title: Make the crab a racer
files: [course.py, crab.py]
entry: crab.py
timeout_ms: 90000
on_pass: { caitlin.surprised.cheer: "Under seventeen moves, and every race finished. My crab has never finished every race." }
hints:
  nudge: "Paul's worked example already learns a grid. What changes on the League course: the step, the starts, the size of the table, gamma?"
  plan:
    - "choose: explore with chance epsilon, otherwise np.argmax of the tile's four values"
    - "q_update: the target is the reward, plus gamma times the next tile's best Q-value unless the race is over"
    - "train: a table of zeros, then races alternately from START and from random_start, at most MAX_MOVES moves each"
    - "greedy_policy: the best action on every tile, as lists"
    - "save_entry: json.dump the League's format, with Q.tolist()"
    - Train, race the greedy policy 50 times, print the average, save league.json
  shape: |
    def train(races, rng, alpha=0.1, gamma=1.0, epsilon=0.1):
        Q = np.zeros((___, ___, 4))
        for practice in range(races):
            tile = START if practice % 2 == 0 else ___
            for _ in range(MAX_MOVES):
                action = choose(Q, tile, ___, rng)
                after, reward, over = step(tile, action, rng)
                q_update(Q, tile, action, reward, after, over, alpha, gamma)
                tile = ___
                if over:
                    break
        return Q
---
Write the five functions of the brief in `crab.py`. `course.py` holds the League's rules, read from `club-course.json`, with `step`, `random_start`, `START` and `MAX_MOVES`.

- `choose`: epsilon-greedy over the four actions, numbered 0 to 3.
- `q_update`: one Q-learning update on the Q-table. It returns the TD error.
- `train`: Paul's loop on the League course. Practice races alternate between `START` and `random_start(rng)`, and stop at `MAX_MOVES`. Every move costs -1 and the League counts moves, so don't discount: `gamma = 1.0`.
- `greedy_policy`: `Q.argmax(axis=2)`, as lists.
- `save_entry`: `json.dump` the League's format, with `Q.tolist()`.

Done, it prints the arrows, a 50-race average under 17 moves with every race finished, and saves `league.json`. The checks train with their own seeds, race your policy 200 times, and read your file.

To watch it learn, call `show_grid(Q.max(axis=2), policy=Q.argmax(axis=2), q=Q)` every hundred races.
