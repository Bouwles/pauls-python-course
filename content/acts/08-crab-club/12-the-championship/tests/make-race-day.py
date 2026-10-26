import json
from collections import deque

import numpy as np

# Moss's own course.py, for building courses to try your baselines on.
COURSE_PY = '# Race-day courses, by the committee\'s rules.\n#\n# A course is a list of strings, one per row: S the start, F the finish,\n# # a rock, ~ a rock pool, . sand. Every move costs -1 and the finish ends\n# the race. Sir Reginald slips sideways one move in ten on sand, and\n# thirty-five in a hundred in a rock pool, either way with equal chance.\n# Into a rock or off the course, he stays put. A race stops at 100 moves.\n\nfrom collections import deque\n\nimport numpy as np\n\nMOVES = ["up", "down", "left", "right"]      # actions 0, 1, 2 and 3\nSTEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]\nSIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]  # a slip turns up or down into left or right, and so on\nSLIP_SAND = 0.1\nSLIP_POOL = 0.35\nMAX_MOVES = 100\nROCK_CHANCE = 0.1\nPOOL_CHANCE = 0.15\n\n\nclass OutOfPractice(Exception):\n    """The stewards have counted every practice move he was allowed."""\n\n\ndef way_through(layout, start, finish):\n    """True if some path of sand and pools joins start to finish."""\n    rows, cols = len(layout), len(layout[0])\n    seen = {start}\n    queue = deque([start])\n    while queue:\n        tile = queue.popleft()\n        if tile == finish:\n            return True\n        for d_row, d_col in STEPS:\n            row, col = tile[0] + d_row, tile[1] + d_col\n            if 0 <= row < rows and 0 <= col < cols and layout[row][col] != "#" and (row, col) not in seen:\n                seen.add((row, col))\n                queue.append((row, col))\n    return False\n\n\ndef generate(seed, rows=7, cols=9):\n    """A race-day course, the same one every time for the same seed."""\n    rng = np.random.default_rng(seed)\n    while True:\n        # Scatter rocks and rock pools\n        grid = [["." for _ in range(cols)] for _ in range(rows)]\n        for row in range(rows):\n            for col in range(cols):\n                draw = rng.random()\n                if draw < ROCK_CHANCE:\n                    grid[row][col] = "#"\n                elif draw < ROCK_CHANCE + POOL_CHANCE:\n                    grid[row][col] = "~"\n        # Two groynes, each with one gap\n        for col in rng.choice(np.arange(2, cols - 2), size=2, replace=False):\n            gap = int(rng.integers(rows))\n            for row in range(rows):\n                grid[row][col] = "." if row == gap else "#"\n        # The start on the left edge, the finish on the right\n        start = (int(rng.integers(rows)), 0)\n        finish = (int(rng.integers(rows)), cols - 1)\n        grid[start[0]][start[1]] = "S"\n        grid[finish[0]][finish[1]] = "F"\n        layout = ["".join(row) for row in grid]\n        # No way through: draw again\n        if way_through(layout, start, finish):\n            return layout\n\n\nclass Course:\n    """A course and its rules."""\n\n    def __init__(self, layout):\n        self.layout = list(layout)\n        self.rows, self.cols = len(layout), len(layout[0])\n        self.rocks, self.pools = set(), set()\n        for row, line in enumerate(layout):\n            for col, mark in enumerate(line):\n                if mark == "#":\n                    self.rocks.add((row, col))\n                elif mark == "~":\n                    self.pools.add((row, col))\n                elif mark == "S":\n                    self.start = (row, col)\n                elif mark == "F":\n                    self.finish = (row, col)\n\n    def move(self, tile, action):\n        """Where one move leads if nothing slips. Into a rock or off the course, he stays put."""\n        row, col = tile[0] + STEPS[action][0], tile[1] + STEPS[action][1]\n        if 0 <= row < self.rows and 0 <= col < self.cols and (row, col) not in self.rocks:\n            return (row, col)\n        return tile\n\n    def step(self, tile, action, rng):\n        """One move, slips and all: (where he ends up, -1, whether he reached the finish)."""\n        slip = SLIP_POOL if tile in self.pools else SLIP_SAND\n        if rng.random() < slip:\n            action = SIDEWAYS[action][0 if rng.random() < 0.5 else 1]\n        after = self.move(tile, action)\n        return after, -1, after == self.finish\n\n\ndef race(course, policy, rng):\n    """One race from the start, following policy (rows of actions). The number of moves it took."""\n    tile = course.start\n    for moves in range(1, MAX_MOVES + 1):\n        tile, _, over = course.step(tile, policy[tile[0]][tile[1]], rng)\n        if over:\n            return moves\n    return MAX_MOVES\n\n\nclass Practice:\n    """The course as Sir Reginald meets it: no map, and a budget of moves the stewards count.\n\n    Moss\'s copy keeps the course out of reach, so nobody can peek at the rocks.\n    """\n\n    def __init__(self, course, budget, rng):\n        self.rows, self.cols = course.rows, course.cols\n        self.start, self.finish = course.start, course.finish\n        self.moves_left = budget\n        where = [course.start]\n\n        def reset():\n            where[0] = course.start\n            return where[0]\n\n        def step(action):\n            if self.moves_left <= 0:\n                raise OutOfPractice("The stewards have counted every practice move.")\n            self.moves_left -= 1\n            where[0], reward, over = course.step(where[0], action, rng)\n            return where[0], reward, over\n\n        self.reset = reset\n        self.step = step\n'

MOSS = {}
exec(COURSE_PY, MOSS)

CLUB = ["S...#....", ".#..#.~..", ".#....~..", "...##...#", ".~....#..", ".~#...#..", "....#...F"]


def distances(course):
    distance = {course.finish: 0}
    queue = deque([course.finish])
    while queue:
        tile = queue.popleft()
        for d_row, d_col in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            before = (tile[0] - d_row, tile[1] - d_col)
            if 0 <= before[0] < course.rows and 0 <= before[1] < course.cols and before not in course.rocks and before not in distance:
                distance[before] = distance[tile] + 1
                queue.append(before)
    return distance


def moss_shortest(course):
    distance, far = distances(course), course.rows * course.cols
    return [[min(range(4), key=lambda a: distance.get(course.move((r, c), a), far)) for c in range(course.cols)] for r in range(course.rows)]


def grid_of(policy, course, what):
    if not isinstance(policy, (list, np.ndarray)) or len(policy) != course.rows or any(len(row) != course.cols for row in policy):
        raise CheckFailed(f"{what} should be {course.rows} rows of {course.cols} actions.", actual=repr(policy)[:120])
    return [[int(a) for a in row] for row in policy]


def gull(ctx):
    m = ctx.module()
    course = MOSS["Course"](["S....", "..#..", "....F"])
    got = grid_of(m.gull_line(course), course, "gull_line")
    want = [[3, 3, 3, 1, 1], [3, 3, 3, 3, 1], [3, 3, 3, 3, 3]]
    for r in range(3):
        for c in range(5):
            if (r, c) != course.finish and got[r][c] != want[r][c]:
                raise CheckFailed(f"gull_line on ({r}, {c}): close the bigger gap to the finish, across on a tie, rocks or not.",
                                  expected=want[r][c], actual=got[r][c])


def shortest(ctx):
    m = ctx.module()
    course = MOSS["Course"](["S.#..", "..#..", "....F"])
    got = grid_of(m.shortest_line(course), course, "shortest_line")
    distance = distances(course)
    for (r, c), d in distance.items():
        if (r, c) == course.finish:
            continue
        after = course.move((r, c), got[r][c])
        if distance.get(after, 99) != d - 1:
            raise CheckFailed(f"shortest_line on ({r}, {c}), {d} moves from the finish, should lead to a tile {d - 1} moves away.",
                              expected=moss_shortest(course)[r][c], actual=got[r][c])


def gull_elsewhere(ctx):
    m = ctx.module()
    course = MOSS["Course"](["..F..", ".....", "S...."])
    got = grid_of(m.gull_line(course), course, "gull_line")
    for (r, c), want in [((2, 0), 3), ((2, 2), 0), ((1, 2), 0), ((0, 4), 2), ((2, 3), 0), ((1, 0), 3)]:
        if got[r][c] != want:
            raise CheckFailed(f"gull_line on ({r}, {c}) should be {want}.", expected=want, actual=got[r][c])


def shortest_elsewhere(ctx):
    m = ctx.module()
    for layout in [["S#...", ".#.#.", "...#F"], ["....S", ".###.", "F...."]]:
        course = MOSS["Course"](layout)
        got = grid_of(m.shortest_line(course), course, "shortest_line")
        distance = distances(course)
        for (r, c), d in distance.items():
            if (r, c) != course.finish and distance.get(course.move((r, c), got[r][c]), 99) != d - 1:
                raise CheckFailed(f"On {layout}, shortest_line on ({r}, {c}) should lead one move nearer the finish.",
                                  expected=moss_shortest(course)[r][c], actual=got[r][c])


def the_day(ctx):
    result = ctx.run_program()
    if result.error is not None:
        raise CheckFailed(f"The program stopped with {type(result.error).__name__}: {result.error}")
    if len(result.lines()) < 6:
        raise CheckFailed("Print a line for each training course, each course he has never seen, and the Club Course.", actual=result.output)
    if "league.json" not in result.files_out:
        raise CheckFailed("The program should save league.json, his policy for the Club Course.")
    try:
        entry = json.loads(result.files_out["league.json"])
    except ValueError:
        raise CheckFailed("league.json isn't JSON. Write it with json.dump.")
    if entry.get("format") != "ppc-league-1":
        raise CheckFailed('league.json needs "format": "ppc-league-1", as the League asks.', actual=entry.get("format"))
    club = MOSS["Course"](CLUB)
    policy = grid_of(entry.get("policy"), club, 'The "policy" in league.json')
    rng = np.random.default_rng(11)
    moves = [MOSS["race"](club, policy, rng) for _ in range(200)]
    par = np.mean([MOSS["race"](club, moss_shortest(club), rng) for _ in range(200)])
    mine, finished = float(np.mean(moves)), sum(m < 100 for m in moves)
    if finished < 190 or mine > 1.25 * par:
        raise CheckFailed(f"On the Club Course his policy averages {mine:.1f} moves and finishes {finished} of 200. Par is {par:.1f}: "
                          f"finish 190 or more, in {1.25 * par:.1f} moves or fewer.", expected=f"{1.25 * par:.1f} or fewer", actual=round(mine, 1))


TESTS = [
    custom("As the gull flies", gull, visible=True),
    custom("The shortest line", shortest, visible=True),
    custom("The gull, from other corners", gull_elsewhere, hint="When the gaps are equal, go across: left or right."),
    custom("The shortest line round rocks", shortest_elsewhere, hint="Search outwards from the finish, then on each tile pick the move whose landing tile is nearest it."),
    custom("Race day, and an entry for the League", the_day, timeout=40),
]
