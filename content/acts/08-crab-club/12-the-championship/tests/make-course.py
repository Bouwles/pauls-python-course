from collections import deque

import numpy as np


def shape_of(layout, rows, cols, what):
    if not isinstance(layout, list) or len(layout) != rows or not all(isinstance(line, str) and len(line) == cols for line in layout):
        raise CheckFailed(f"{what} should be a list of {rows} strings, each {cols} long.", actual=repr(layout)[:120])
    letters = set("".join(layout))
    if not letters <= set("SF#~."):
        raise CheckFailed(f"{what} has letters other than S, F, #, ~ and .", actual=sorted(letters - set("SF#~.")))
    if "".join(layout).count("S") != 1 or "".join(layout).count("F") != 1:
        raise CheckFailed(f"{what} should have exactly one S and one F.", actual=layout)
    if not any(line[0] == "S" for line in layout):
        raise CheckFailed(f"{what}: the start goes on the left edge, in the first column.", actual=layout)
    if not any(line[-1] == "F" for line in layout):
        raise CheckFailed(f"{what}: the finish goes on the right edge, in the last column.", actual=layout)


def find(layout, letter):
    for row, line in enumerate(layout):
        if letter in line:
            return (row, line.index(letter))


def reachable(layout):
    start, finish = find(layout, "S"), find(layout, "F")
    seen, queue = {start}, deque([start])
    while queue:
        row, col = queue.popleft()
        if (row, col) == finish:
            return True
        for d_row, d_col in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nxt = (row + d_row, col + d_col)
            if 0 <= nxt[0] < len(layout) and 0 <= nxt[1] < len(layout[0]) and layout[nxt[0]][nxt[1]] != "#" and nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return False


def groynes(layout):
    rows, cols = len(layout), len(layout[0])
    return [col for col in range(2, cols - 2) if sum(layout[row][col] == "#" for row in range(rows)) == rows - 1]


def league_shape(ctx):
    m = ctx.module()
    first = m.generate(2026)
    shape_of(first, 7, 9, "generate(2026)")
    if m.generate(2026) != first:
        raise CheckFailed("The same seed should give the same course every time. Make every random choice with one rng made from the seed.",
                          expected=first, actual=m.generate(2026))


def a_course(ctx):
    m = ctx.module()
    course = m.Course(["S.#", ".~F"])
    for name, want in [("rows", 2), ("cols", 3), ("start", (0, 0)), ("finish", (1, 2)), ("rocks", {(0, 2)}), ("pools", {(1, 1)})]:
        got = getattr(course, name, None)
        if (set(got) if name in ("rocks", "pools") and got is not None else got) != want:
            raise CheckFailed(f"Course(['S.#', '.~F']).{name} should be {want}.", expected=want, actual=got)


def different_seeds(ctx):
    m = ctx.module()
    layouts = {tuple(m.generate(seed)) for seed in range(10)}
    if len(layouts) < 8:
        raise CheckFailed("Ten seeds gave hardly any different courses. Make the rng from the seed: np.random.default_rng(seed).",
                          expected="about 10 different courses", actual=f"{len(layouts)} different")


def always_a_way(ctx):
    m = ctx.module()
    for seed in range(60):
        layout = m.generate(seed)
        if not reachable(layout):
            raise CheckFailed(f"generate({seed}) has no way from the start to the finish. When that happens, draw again.", actual=layout)


def two_groynes(ctx):
    m = ctx.module()
    for seed in range(30):
        layout = m.generate(seed)
        if len(groynes(layout)) < 2:
            raise CheckFailed(f"generate({seed}) should have two groynes: columns between 2 and cols - 3 that are rock all the way down but for one gap.",
                              actual=layout)


def other_sizes(ctx):
    m = ctx.module()
    for rows, cols in [(5, 12), (8, 8), (6, 11)]:
        layout = m.generate(7, rows=rows, cols=cols)
        shape_of(layout, rows, cols, f"generate(7, rows={rows}, cols={cols})")
        if len(groynes(layout)) < 2 or not reachable(layout):
            raise CheckFailed(f"generate(7, rows={rows}, cols={cols}) should follow the same rules: two groynes and a way through.", actual=layout)


def scattering(ctx):
    m = ctx.module()
    rock = pool = total = 0
    for seed in range(150):
        layout = m.generate(seed)
        skip = set(groynes(layout))
        for line in layout:
            for col, mark in enumerate(line):
                if col in skip or mark in "SF":
                    continue
                total += 1
                rock += mark == "#"
                pool += mark == "~"
    if not 0.06 <= rock / total <= 0.13:
        raise CheckFailed("Away from the groynes, about one tile in ten should be a rock.", expected="about 10%", actual=f"{rock / total:.0%}")
    if not 0.11 <= pool / total <= 0.19:
        raise CheckFailed("Away from the groynes, about fifteen tiles in a hundred should be rock pools.", expected="about 15%", actual=f"{pool / total:.0%}")


def moves(ctx):
    m = ctx.module()
    course = m.Course(["S.#", ".~F"])
    for tile, action, want in [((0, 0), 3, (0, 1)), ((0, 0), 0, (0, 0)), ((0, 0), 2, (0, 0)), ((0, 1), 3, (0, 1)), ((1, 1), 3, (1, 2)), ((0, 1), 1, (1, 1))]:
        got = course.move(tile, action)
        if got is None or tuple(got) != want:
            raise CheckFailed(f"course.move({tile}, {action}) should be {want}: off the course or into a rock, it stays put.", expected=want, actual=got)


def slips(ctx):
    m = ctx.module()
    course = m.Course([".....", ".S~..", "....F"])
    rng = np.random.default_rng(4)
    for tile, chance, where in [((1, 1), 0.10, "on sand"), ((1, 2), 0.35, "in a rock pool")]:
        landed = {}
        for _ in range(4000):
            after, reward, over = course.step(tile, 3, rng)
            if reward != -1:
                raise CheckFailed("Every move costs -1.", actual=reward)
            landed[tuple(after)] = landed.get(tuple(after), 0) + 1
        up, down = landed.get((tile[0] - 1, tile[1]), 0) / 4000, landed.get((tile[0] + 1, tile[1]), 0) / 4000
        if abs(up - chance / 2) > 0.025 or abs(down - chance / 2) > 0.025:
            raise CheckFailed(f"Told right {where}, it should slip up {chance / 2:.1%} and down {chance / 2:.1%} of the time.",
                              expected=f"{chance / 2:.1%} each", actual=f"up {up:.1%}, down {down:.1%}")


def finishing(ctx):
    m = ctx.module()
    course = m.Course(["S.F"])
    rng = np.random.default_rng(0)
    for _ in range(100):
        after, reward, over = course.step((0, 1), 3, rng)
        if tuple(after) == (0, 2):
            if over is not True:
                raise CheckFailed("Stepping onto the finish ends the race: over should be True.", actual=over)
            return
        if over:
            raise CheckFailed("Only the finish ends the race.", actual=(after, over))
    raise CheckFailed("Told right from beside the finish, it should reach it nine times in ten.")


def races(ctx):
    m = ctx.module()
    rng = np.random.default_rng(5)
    quick = m.Course(["SF"])
    got = np.mean([m.race(quick, [[3, 3]], rng) for _ in range(3000)])
    if abs(got - 1 / 0.9) > 0.03:
        raise CheckFailed("On a course of two tiles, told right, it finishes in one move nine times in ten: about 1.11 moves on average.",
                          expected=1.11, actual=round(float(got), 2))
    stuck = m.Course(["S#F"])
    got = m.race(stuck, [[3, 3, 3]], rng)
    if got != 100:
        raise CheckFailed("Told right into a rock for ever, it never finishes: race should stop at 100 moves and return 100.", expected=100, actual=got)


def practice(ctx):
    m = ctx.module()
    course = m.Course(["S..", "..F"])
    p = m.Practice(course, 5, np.random.default_rng(6))
    for name, want in [("rows", 2), ("cols", 3), ("start", (0, 0)), ("finish", (1, 2)), ("moves_left", 5)]:
        if getattr(p, name, None) != want:
            raise CheckFailed(f"A Practice should know its {name}: {want}.", expected=want, actual=getattr(p, name, None))
    if tuple(p.reset()) != (0, 0):
        raise CheckFailed("reset() should put the crab back on the start and return it.")
    tile, reward, over = p.step(3)
    tile, reward, over = p.step(1)
    if p.moves_left != 3:
        raise CheckFailed("Each practice move uses one from the budget.", expected=3, actual=p.moves_left)
    p.step(3)
    p.step(3)
    p.step(3)
    try:
        p.step(3)
    except m.OutOfPractice:
        return
    except Exception as problem:
        raise CheckFailed(f"With the budget spent, step should raise OutOfPractice, not {type(problem).__name__}.")
    raise CheckFailed("With the budget spent, step should raise OutOfPractice.")


def practice_moves_on(ctx):
    m = ctx.module()
    course = m.Course(["S....F"])
    p = m.Practice(course, 1000, np.random.default_rng(7))
    p.reset()
    for _ in range(200):
        tile, reward, over = p.step(3)
        if over:
            break
    if not over or tuple(tile) != (0, 5):
        raise CheckFailed("Practice moves should carry on from wherever the last one left it, until it reaches the finish.", actual=tile)


TESTS = [
    custom("The League's shape, the same every time", league_shape, visible=True),
    custom("A Course from a layout", a_course, visible=True),
    custom("Different seeds, different courses", different_seeds),
    custom("Always a way through", always_a_way, hint="After placing everything, search from the start (breadth-first, as in the Puzzle Room). No way through: draw a whole new course."),
    custom("Two groynes", two_groynes),
    custom("Other sizes", other_sizes, hint="Groynes go in columns 2 to cols - 3, so use cols, not 9."),
    custom("Rocks and pools, scattered", scattering),
    custom("Moves, edges and rocks", moves),
    custom("Slips, on sand and in pools", slips, hint="Slip with chance SLIP_POOL in a pool, SLIP_SAND elsewhere; then left or right of the move, half each."),
    custom("The finish ends the race", finishing),
    custom("Races, short and endless", races, hint="Stop after MAX_MOVES and return MAX_MOVES if it hasn't finished."),
    custom("Practice, counted", practice, hint="Count moves_left down in step, and raise OutOfPractice once it reaches 0."),
    custom("Practice carries on", practice_moves_on),
]
