# Race-day courses, by the Arcade League's rules.
#
# A course is a list of strings, one per row: S the start, F the finish,
# # a rock, ~ a rock pool, . sand. Every move costs -1 and the finish ends
# the race. The crab slips sideways one move in ten on sand, and
# thirty-five in a hundred in a rock pool, either way with equal chance.
# Into a rock or off the course, it stays put. A race stops at 100 moves.

from collections import deque

import numpy as np

MOVES = ["up", "down", "left", "right"]      # actions 0, 1, 2 and 3
STEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]
SIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]  # a slip turns up or down into left or right, and so on
SLIP_SAND = 0.1
SLIP_POOL = 0.35
MAX_MOVES = 100
ROCK_CHANCE = 0.1
POOL_CHANCE = 0.15


class OutOfPractice(Exception):
    """The League has counted every practice move the crab was allowed."""


def way_through(layout, start, finish):
    """True if some path of sand and pools joins start to finish."""
    rows, cols = len(layout), len(layout[0])
    seen = {start}
    queue = deque([start])
    while queue:
        tile = queue.popleft()
        if tile == finish:
            return True
        for d_row, d_col in STEPS:
            row, col = tile[0] + d_row, tile[1] + d_col
            if 0 <= row < rows and 0 <= col < cols and layout[row][col] != "#" and (row, col) not in seen:
                seen.add((row, col))
                queue.append((row, col))
    return False


def generate(seed, rows=7, cols=9):
    """A race-day course, the same one every time for the same seed."""
    rng = np.random.default_rng(seed)
    while True:
        # Scatter rocks and rock pools
        grid = [["." for _ in range(cols)] for _ in range(rows)]
        for row in range(rows):
            for col in range(cols):
                draw = rng.random()
                if draw < ROCK_CHANCE:
                    grid[row][col] = "#"
                elif draw < ROCK_CHANCE + POOL_CHANCE:
                    grid[row][col] = "~"
        # Two groynes, each with one gap
        for col in rng.choice(np.arange(2, cols - 2), size=2, replace=False):
            gap = int(rng.integers(rows))
            for row in range(rows):
                grid[row][col] = "." if row == gap else "#"
        # The start on the left edge, the finish on the right
        start = (int(rng.integers(rows)), 0)
        finish = (int(rng.integers(rows)), cols - 1)
        grid[start[0]][start[1]] = "S"
        grid[finish[0]][finish[1]] = "F"
        layout = ["".join(row) for row in grid]
        # No way through: draw again
        if way_through(layout, start, finish):
            return layout


class Course:
    """A course and its rules."""

    def __init__(self, layout):
        self.layout = list(layout)
        self.rows, self.cols = len(layout), len(layout[0])
        self.rocks, self.pools = set(), set()
        for row, line in enumerate(layout):
            for col, mark in enumerate(line):
                if mark == "#":
                    self.rocks.add((row, col))
                elif mark == "~":
                    self.pools.add((row, col))
                elif mark == "S":
                    self.start = (row, col)
                elif mark == "F":
                    self.finish = (row, col)

    def move(self, tile, action):
        """Where one move leads if nothing slips. Into a rock or off the course, it stays put."""
        row, col = tile[0] + STEPS[action][0], tile[1] + STEPS[action][1]
        if 0 <= row < self.rows and 0 <= col < self.cols and (row, col) not in self.rocks:
            return (row, col)
        return tile

    def step(self, tile, action, rng):
        """One move, slips and all: (where it ends up, -1, whether it reached the finish)."""
        slip = SLIP_POOL if tile in self.pools else SLIP_SAND
        if rng.random() < slip:
            action = SIDEWAYS[action][0 if rng.random() < 0.5 else 1]
        after = self.move(tile, action)
        return after, -1, after == self.finish


def race(course, policy, rng):
    """One race from the start, following policy (rows of actions). The number of moves it took."""
    tile = course.start
    for moves in range(1, MAX_MOVES + 1):
        tile, _, over = course.step(tile, policy[tile[0]][tile[1]], rng)
        if over:
            return moves
    return MAX_MOVES


class Practice:
    """The course as the crab meets it: no map, and a budget of moves the League counts."""

    def __init__(self, course, budget, rng):
        self._course = course
        self._rng = rng
        self.rows, self.cols = course.rows, course.cols
        self.start, self.finish = course.start, course.finish
        self.moves_left = budget
        self.tile = course.start

    def reset(self):
        """Back to the start for another practice race."""
        self.tile = self.start
        return self.tile

    def step(self, action):
        """One practice move: (where it ends up, -1, whether it reached the finish)."""
        if self.moves_left <= 0:
            raise OutOfPractice("The League has counted every practice move.")
        self.moves_left -= 1
        self.tile, reward, over = self._course.step(self.tile, action, self._rng)
        return self.tile, reward, over
