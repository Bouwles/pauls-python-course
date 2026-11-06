---
id: make-race-day
type: make
title: Race day
files: [course.py, crab.py, race_day.py]
entry: race_day.py
starter_from: make-crab
timeout_ms: 40000
on_pass: { aaesha.pleased: "Two baselines, a table, and courses held back until the end. That's an honest result." }
hints:
  nudge: "The shortest line needs to know how far every tile is from the finish. Which search, from Act IV, finds that from one starting point?"
  plan:
    - "gull_line: close the bigger gap to the finish, across on a tie"
    - "shortest_line: breadth-first from the finish, then on each tile the move whose landing tile is nearest it"
    - "A line per course: practise with a fresh Practice of BUDGET moves, race 200 times, par and the gull alongside"
    - "Watch one race on the last test course, a show_grid frame per move"
    - "Practise on the League course and save league.json"
  shape: |
    def shortest_line(course):
        distance = {course.finish: 0}
        queue = deque([course.finish])
        while queue:
            tile = queue.popleft()
            for d_row, d_col in STEPS:
                before = (tile[0] - d_row, tile[1] - d_col)
                if ___:
                    distance[before] = ___
                    queue.append(before)
        far = course.rows * course.cols
        return [[min(range(4), key=lambda action: distance.get(course.move((row, col), action), ___))
                 for col in range(course.cols)] for row in range(course.rows)]
---
Race day, in `race_day.py`. A result needs something to compare it with, so first two **baselines**, simple lines your crab should match or beat:

1. `gull_line(course)`: on every tile, head for the finish as the gull flies, closing the bigger gap, across on a tie, rocks or no rocks.
2. `shortest_line(course)`: breadth-first search out from the finish, then on every tile the move whose landing tile is nearest it. **Par** is its average.
3. As a program: practise and race on each `TRAINING` course, then each `TESTING` course, a line each, as in the brief. Watch one race on the last test course with `show_grid`, rocks as `walls`. Then practise on the League course in `club-course.json` and save `league.json`.

Done: the brief's table, your crab near par and far ahead of the gull, and a `league.json`, which appears on the Arcade League page, /league, ready to enter.
