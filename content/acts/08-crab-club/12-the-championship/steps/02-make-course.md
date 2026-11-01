---
id: make-course
type: make
title: The course
files: [course.py]
entry: course.py
on_pass: { caitlin.proud.thumbs: "Two groynes, a gap in each, and always a way through. My generator, finally tested." }
hints:
  nudge: "How can `generate` be random and still give the same course every time it's given the same seed?"
  plan:
    - "One rng from the seed, used for every choice, in the same order every time"
    - "Scatter rocks and pools, then the two groynes, then the start and the finish"
    - "Search from the start, as in the Puzzle Room; with no way through, draw again"
    - "Course: read the layout once into rows, cols, start, finish, rocks and pools"
    - "step: slip with the tile's chance, then move; -1, and whether it's on the finish"
    - "Practice: count moves_left down, and raise OutOfPractice when it's spent"
  shape: |
    def generate(seed, rows=7, cols=9):
        rng = np.random.default_rng(___)
        while True:
            grid = [["." for _ in range(cols)] for _ in range(rows)]
            ...
            for col in rng.choice(np.arange(2, cols - 2), size=2, replace=___):
                gap = int(rng.integers(rows))
                for row in range(rows):
                    grid[row][col] = "." if row == gap else ___
            ...
            if way_through(layout, start, finish):
                return layout


    class Practice:
        ...
        def step(self, action):
            if self.moves_left <= 0:
                raise ___
            self.moves_left -= 1
            ...
---
The rules and constants are at the top of `course.py`. Write the rest:

1. `generate(seed, rows=7, cols=9)`. Each tile is a rock with chance `ROCK_CHANCE`, otherwise a pool with chance `POOL_CHANCE`, otherwise sand. Then two **groynes**: two different columns from 2 to `cols - 3`, rock all the way down but for a sand gap in a random row. The start goes in a random row of the first column, the finish in a random row of the last. No way through: draw again.
2. `Course(layout)`, with `layout`, `rows`, `cols`, `start`, `finish`, sets of `rocks` and `pools`, `move(tile, action)` and `step(tile, action, rng)`.
3. `race(course, policy, rng)`. A policy is rows of actions, as the League takes them.
4. `OutOfPractice`, and `Practice(course, budget, rng)`, with `rows`, `cols`, `start`, `finish`, `moves_left`, `reset()` and `step(action)`.

The checks try `generate` on hundreds of seeds.
