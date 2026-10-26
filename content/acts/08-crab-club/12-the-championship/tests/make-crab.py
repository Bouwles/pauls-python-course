import importlib
from collections import deque

import numpy as np

# Moss's own course.py, the stewards' copy: its Practice keeps the map out of reach.
COURSE_PY = '# Race-day courses, by the committee\'s rules.\n#\n# A course is a list of strings, one per row: S the start, F the finish,\n# # a rock, ~ a rock pool, . sand. Every move costs -1 and the finish ends\n# the race. Sir Reginald slips sideways one move in ten on sand, and\n# thirty-five in a hundred in a rock pool, either way with equal chance.\n# Into a rock or off the course, he stays put. A race stops at 100 moves.\n\nfrom collections import deque\n\nimport numpy as np\n\nMOVES = ["up", "down", "left", "right"]      # actions 0, 1, 2 and 3\nSTEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]\nSIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]  # a slip turns up or down into left or right, and so on\nSLIP_SAND = 0.1\nSLIP_POOL = 0.35\nMAX_MOVES = 100\nROCK_CHANCE = 0.1\nPOOL_CHANCE = 0.15\n\n\nclass OutOfPractice(Exception):\n    """The stewards have counted every practice move he was allowed."""\n\n\ndef way_through(layout, start, finish):\n    """True if some path of sand and pools joins start to finish."""\n    rows, cols = len(layout), len(layout[0])\n    seen = {start}\n    queue = deque([start])\n    while queue:\n        tile = queue.popleft()\n        if tile == finish:\n            return True\n        for d_row, d_col in STEPS:\n            row, col = tile[0] + d_row, tile[1] + d_col\n            if 0 <= row < rows and 0 <= col < cols and layout[row][col] != "#" and (row, col) not in seen:\n                seen.add((row, col))\n                queue.append((row, col))\n    return False\n\n\ndef generate(seed, rows=7, cols=9):\n    """A race-day course, the same one every time for the same seed."""\n    rng = np.random.default_rng(seed)\n    while True:\n        # Scatter rocks and rock pools\n        grid = [["." for _ in range(cols)] for _ in range(rows)]\n        for row in range(rows):\n            for col in range(cols):\n                draw = rng.random()\n                if draw < ROCK_CHANCE:\n                    grid[row][col] = "#"\n                elif draw < ROCK_CHANCE + POOL_CHANCE:\n                    grid[row][col] = "~"\n        # Two groynes, each with one gap\n        for col in rng.choice(np.arange(2, cols - 2), size=2, replace=False):\n            gap = int(rng.integers(rows))\n            for row in range(rows):\n                grid[row][col] = "." if row == gap else "#"\n        # The start on the left edge, the finish on the right\n        start = (int(rng.integers(rows)), 0)\n        finish = (int(rng.integers(rows)), cols - 1)\n        grid[start[0]][start[1]] = "S"\n        grid[finish[0]][finish[1]] = "F"\n        layout = ["".join(row) for row in grid]\n        # No way through: draw again\n        if way_through(layout, start, finish):\n            return layout\n\n\nclass Course:\n    """A course and its rules."""\n\n    def __init__(self, layout):\n        self.layout = list(layout)\n        self.rows, self.cols = len(layout), len(layout[0])\n        self.rocks, self.pools = set(), set()\n        for row, line in enumerate(layout):\n            for col, mark in enumerate(line):\n                if mark == "#":\n                    self.rocks.add((row, col))\n                elif mark == "~":\n                    self.pools.add((row, col))\n                elif mark == "S":\n                    self.start = (row, col)\n                elif mark == "F":\n                    self.finish = (row, col)\n\n    def move(self, tile, action):\n        """Where one move leads if nothing slips. Into a rock or off the course, he stays put."""\n        row, col = tile[0] + STEPS[action][0], tile[1] + STEPS[action][1]\n        if 0 <= row < self.rows and 0 <= col < self.cols and (row, col) not in self.rocks:\n            return (row, col)\n        return tile\n\n    def step(self, tile, action, rng):\n        """One move, slips and all: (where he ends up, -1, whether he reached the finish)."""\n        slip = SLIP_POOL if tile in self.pools else SLIP_SAND\n        if rng.random() < slip:\n            action = SIDEWAYS[action][0 if rng.random() < 0.5 else 1]\n        after = self.move(tile, action)\n        return after, -1, after == self.finish\n\n\ndef race(course, policy, rng):\n    """One race from the start, following policy (rows of actions). The number of moves it took."""\n    tile = course.start\n    for moves in range(1, MAX_MOVES + 1):\n        tile, _, over = course.step(tile, policy[tile[0]][tile[1]], rng)\n        if over:\n            return moves\n    return MAX_MOVES\n\n\nclass Practice:\n    """The course as Sir Reginald meets it: no map, and a budget of moves the stewards count.\n\n    Moss\'s copy keeps the course out of reach, so nobody can peek at the rocks.\n    """\n\n    def __init__(self, course, budget, rng):\n        self.rows, self.cols = course.rows, course.cols\n        self.start, self.finish = course.start, course.finish\n        self.moves_left = budget\n        where = [course.start]\n\n        def reset():\n            where[0] = course.start\n            return where[0]\n\n        def step(action):\n            if self.moves_left <= 0:\n                raise OutOfPractice("The stewards have counted every practice move.")\n            self.moves_left -= 1\n            where[0], reward, over = course.step(where[0], action, rng)\n            return where[0], reward, over\n\n        self.reset = reset\n        self.step = step\n'

BUDGET = 5000


def setup(ctx):
    crab = ctx.module(files={"course.py": COURSE_PY})
    return crab, importlib.import_module("course")


def shortest_line(course):
    distance = {course.finish: 0}
    queue = deque([course.finish])
    while queue:
        tile = queue.popleft()
        for d_row, d_col in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            before = (tile[0] - d_row, tile[1] - d_col)
            if 0 <= before[0] < course.rows and 0 <= before[1] < course.cols and before not in course.rocks and before not in distance:
                distance[before] = distance[tile] + 1
                queue.append(before)
    far = course.rows * course.cols
    return [[min(range(4), key=lambda a: distance.get(course.move((r, c), a), far)) for c in range(course.cols)] for r in range(course.rows)]


def gull_line(course):
    policy = []
    for r in range(course.rows):
        row = []
        for c in range(course.cols):
            down, across = course.finish[0] - r, course.finish[1] - c
            row.append((3 if across > 0 else 2) if abs(across) >= abs(down) else (1 if down > 0 else 0))
        policy.append(row)
    return policy


def checked_policy(policy, course):
    if not isinstance(policy, (list, np.ndarray)) or len(policy) != course.rows or any(len(row) != course.cols for row in policy):
        raise CheckFailed(f"train should return a policy: {course.rows} rows of {course.cols} actions, a move for every tile, "
                          "even ones he never reached.", actual=repr(policy)[:120])
    clean = []
    for row in policy:
        clean_row = []
        for action in row:
            if isinstance(action, (bool, np.bool_)) or not isinstance(action, (int, np.integer)) or not 0 <= int(action) <= 3:
                raise CheckFailed("Every move in the policy should be an action from 0 to 3: up, down, left, right.", actual=repr(action))
            clean_row.append(int(action))
        clean.append(clean_row)
    return clean


def race_day(seed, rows=7, cols=9):
    def check(ctx):
        crab, course_module = setup(ctx)
        course = course_module.Course(course_module.generate(seed, rows, cols))
        practice = course_module.Practice(course, BUDGET, np.random.default_rng(seed + 1))
        try:
            policy = crab.train(practice, np.random.default_rng(seed + 2))
        except course_module.OutOfPractice:
            raise CheckFailed("train let OutOfPractice escape. When the stewards say stop, catch it and return the policy he has.")
        except AttributeError as problem:
            raise CheckFailed(f"train used something a Practice doesn't have ({problem}). Sir Reginald gets rows, cols, start, finish, "
                              "moves_left, reset() and step(action), and no map.")
        policy = checked_policy(policy, course)
        rng = np.random.default_rng(seed + 3)
        moves = [course_module.race(course, policy, rng) for _ in range(200)]
        par = np.mean([course_module.race(course, shortest_line(course), rng) for _ in range(200)])
        gull = np.mean([course_module.race(course, gull_line(course), rng) for _ in range(200)])
        mine, finished = float(np.mean(moves)), sum(m < 100 for m in moves)
        if finished < 190:
            raise CheckFailed(f"On course {seed} he finished only {finished} of 200 races. He should finish at least 190.",
                              expected="190 or more", actual=finished)
        if mine > 1.25 * par:
            raise CheckFailed(f"On course {seed} he averaged {mine:.1f} moves. Par, the shortest line, takes {par:.1f}, and the gull {gull:.1f}. "
                              f"Get within a quarter of par: {1.25 * par:.1f} or fewer.", expected=f"{1.25 * par:.1f} or fewer", actual=round(mine, 1))
    return check


def within_budget(ctx):
    crab, course_module = setup(ctx)
    course = course_module.Course(course_module.generate(77))
    practice = course_module.Practice(course, 300, np.random.default_rng(1))
    try:
        policy = crab.train(practice, np.random.default_rng(2))
    except course_module.OutOfPractice:
        raise CheckFailed("With a budget of 300 moves, train let OutOfPractice escape. Catch it, and return the policy he has so far.")
    checked_policy(policy, course)


TESTS = [
    custom("Race day on course 2026", race_day(2026), visible=True, timeout=20),
    custom("A small budget", within_budget, visible=True,
           hint="Wrap the practice loop in try, and catch OutOfPractice: then return the best move on every tile."),
    custom("An unseen course", race_day(4242), timeout=20,
           hint="Practice moves are scarce. Remember every move and learn from it again and again, as Deep Q's replay buffer did."),
    custom("An unseen course, long and narrow", race_day(9001, 6, 11), timeout=20,
           hint="Use practice.rows and practice.cols, never 7 and 9."),
    custom("An unseen course, square", race_day(31337, 8, 8), timeout=20,
           hint="If he wanders in circles, let the step size and epsilon shrink as he practises, so the values settle."),
]
