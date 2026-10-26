---
id: make
type: make
title: Make Sir Reginald a racer
files: [course.py, crab.py]
entry: crab.py
timeout_ms: 90000
on_pass: { committee: "Under seventeen moves, every race finished. He has never finished every race." }
hints:
  nudge: "Moss's worked example already learns a grid. What changes on the Club Course: the step, the starts, the size of the table, gamma?"
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
`course.py` holds the League's rules, read from `club-course.json`. Actions are numbers now, 0 to 3 for up, down, left and right, so they can index the table. Every move costs -1 and the League counts moves, so don't discount: `gamma = 1.0`.

To watch him learn, at the start of every hundredth practice race call:

```python
show_grid(Q.max(axis=2), policy=Q.argmax(axis=2), q=Q, crab=tile,
          walls=ROCKS, goal=FINISH, title=f"practice race {practice}")
```

Press Run and play it: the arrows settle from the finish backwards. Point at a tile for its four Q-values.

The checks train with their own seeds, then race your greedy policy 200 times under the League's rules. It must finish at least 198 and average under 17 moves. They read your `league.json` the same way.
