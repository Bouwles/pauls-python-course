# Race day: the crab against courses it has never seen, and the League course for the League.

import json
from collections import deque

import numpy as np
try:
    from workshop import show_grid  # draws in the workshop's output panel
except ImportError:  # anywhere else, drawing does nothing and the rest still runs
    def show_grid(*args, **kwargs):
        pass

from course import MAX_MOVES, STEPS, Course, Practice, generate, race
from crab import train

BUDGET = 5000                # practice moves the League allows on each course
TRAINING = [1, 2, 3]         # courses for trying out ideas
TESTING = [101, 102]         # courses kept back until the end


def gull_line(course):
    """Head for the finish as the gull flies: close the bigger gap, across on a tie. Rocks are ignored."""
    policy = []
    for row in range(course.rows):
        moves = []
        for col in range(course.cols):
            down, across = course.finish[0] - row, course.finish[1] - col
            if abs(across) >= abs(down):
                moves.append(3 if across > 0 else 2)
            else:
                moves.append(1 if down > 0 else 0)
        policy.append(moves)
    return policy


def shortest_line(course):
    """On every tile, the move to the neighbour fewest moves from the finish, if nothing slips."""
    distance = {course.finish: 0}
    queue = deque([course.finish])
    while queue:
        tile = queue.popleft()
        for d_row, d_col in STEPS:
            before = (tile[0] - d_row, tile[1] - d_col)
            if (0 <= before[0] < course.rows and 0 <= before[1] < course.cols
                    and before not in course.rocks and before not in distance):
                distance[before] = distance[tile] + 1
                queue.append(before)
    far = course.rows * course.cols
    return [[min(range(4), key=lambda action: distance.get(course.move((row, col), action), far))
             for col in range(course.cols)] for row in range(course.rows)]


def mean_moves(course, policy, rng, races=200):
    """Race policy races times: the average number of moves, and how many finished."""
    moves = [race(course, policy, rng) for _ in range(races)]
    return float(np.mean(moves)), sum(m < MAX_MOVES for m in moves)


def watch(course, policy, rng, title):
    """Draw one race, a frame a move: the course, its policy, and where it is."""
    values = [[None if (r, c) in course.rocks else (-0.3 if (r, c) in course.pools else 0)
               for c in range(course.cols)] for r in range(course.rows)]
    tile = course.start
    show_grid(values, policy=policy, crab=tile, walls=list(course.rocks), goal=[course.finish], title=title)
    for move in range(1, MAX_MOVES + 1):
        tile, _, over = course.step(tile, policy[tile[0]][tile[1]], rng)
        show_grid(values, policy=policy, crab=tile, walls=list(course.rocks), goal=[course.finish], title=f"{title}, move {move}")
        if over:
            break


def race_day(seed, rng, label):
    """Practise on one course, race it 200 times, and print a line for the table."""
    course = Course(generate(seed))
    policy = train(Practice(course, BUDGET, rng), rng)
    mine, finished = mean_moves(course, policy, rng)
    par, _ = mean_moves(course, shortest_line(course), rng)
    gull, _ = mean_moves(course, gull_line(course), rng)
    print(f"{label} {seed}: {mine:.1f} moves, {finished} of 200 finished (par {par:.1f}, the gull {gull:.1f})")
    return course, policy


if __name__ == "__main__":
    rng = np.random.default_rng(2026)
    print("Training courses")
    for seed in TRAINING:
        race_day(seed, rng, "Course")
    print("Courses it has never seen")
    for seed in TESTING:
        course, policy = race_day(seed, rng, "Course")
    watch(course, policy, rng, f"course {TESTING[-1]}")

    with open("club-course.json") as f:
        club = Course(json.load(f)["layout"])
    policy = train(Practice(club, BUDGET, rng), rng)
    mine, finished = mean_moves(club, policy, rng)
    print(f"The League course: {mine:.1f} moves, {finished} of 200 finished")
    with open("league.json", "w") as f:
        json.dump({"format": "ppc-league-1", "policy": policy}, f)
    print("Saved league.json for the Arcade League.")
