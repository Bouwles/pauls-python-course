---
id: make-crab
type: make
title: The crab
files: [course.py, crab.py]
entry: crab.py
starter_from: make-course
timeout_ms: 30000
on_pass: { yahya.surprised: "Four courses it had never seen, and within a whisker of par on every one." }
hints:
  nudge: "A practice move costs budget. Learning again from a move it remembers costs nothing. How many times could each practice move teach it something?"
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
Now the crab. `train(practice, rng)` practises until the League raises `OutOfPractice`, then returns a policy: `practice.rows` rows of `practice.cols` actions, a move for every tile.

It gets no map: Paul's own `Practice`, with `rows`, `cols`, `start`, `finish`, `moves_left`, `reset()` and `step(action)`, and nothing more.

Start from the Q-Learning Crab's learner, then:

1. Start every Q-value at the hopeful guess.
2. Remember every move, and after each one learn from it and ten more from memory.
3. Let epsilon and the step size shrink race by race.
4. Catch `OutOfPractice`, and return the best move on every tile.

Done: on unseen courses of three sizes, with 5000 practice moves, it finishes at least 190 races in 200 and averages within a quarter of **par**, the moves the shortest line takes. The comment at the top says why each setting is what it is.
