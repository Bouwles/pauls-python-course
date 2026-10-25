---
id: make-crab
type: make
title: The crab
files: [course.py, crab.py]
entry: crab.py
starter_from: make-course
timeout_ms: 30000
on_pass: { committee: "Four courses he had never seen, and within a whisker of par on every one." }
hints:
  nudge: "A practice move costs budget. Learning again from a move he remembers costs nothing. How many times could each practice move teach him something?"
  plan:
    - "Start every Q-value at a hopeful guess: minus the gull's distance to the finish"
    - "Practise races from the start until OutOfPractice, then return the best move on every tile"
    - "Remember every move; after each one, learn again from a handful picked at random from memory"
    - "Let epsilon and the step size shrink race by race, so the values settle"
    - "Watch a race on a new course with show_grid: circles mean the values haven't settled"
  shape: |
    def train(practice, rng, replay=10, gamma=0.99):
        q = hopeful_guess(practice)
        memory = []
        races = 0
        try:
            while True:
                races += 1
                epsilon = max(0.05, ___ ** races)
                rate = max(0.05, 0.5 * ___ ** races)
                tile = practice.reset()
                for _ in range(MAX_MOVES):
                    ...
                    memory.append((tile, action, reward, after, over))
                    for i in [len(memory) - 1] + list(rng.integers(len(memory), size=___)):
                        ...
        except ___:
            pass
        return q.argmax(axis=2).tolist()
---
Now Sir Reginald. `train(practice, rng)` practises until the stewards raise `OutOfPractice`, then returns a policy: `practice.rows` rows of `practice.cols` actions, a move for every tile, even ones he never reached.

He gets no map. The checks hand him Moss's own `Practice`, which has `rows`, `cols`, `start`, `finish`, `moves_left`, `reset()` and `step(action)` and nothing more, and Moss's `course.py`, with only the names in the brief.

Each course allows 5000 practice moves. That isn't many. Try Q-Crab's Q-learner as it was, and race what it learns. Then think about what a practice move is worth, and how to get more learning out of each one.

The checks practise him on unseen courses of three sizes and want him within a quarter of **par**: the average moves of the shortest line.
