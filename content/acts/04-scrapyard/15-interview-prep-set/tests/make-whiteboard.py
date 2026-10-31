import copy as _copy
import random as _random
from collections import deque as _deque


class TooMany(Exception):
    pass


class CountingList(list):
    """A list of weights that counts every weight looked at."""

    def __init__(self, items, limit):
        super().__init__(items)
        self.looks = 0
        self.limit = limit

    def tick(self, amount=1):
        self.looks += amount
        if self.looks > self.limit:
            raise TooMany()

    def __iter__(self):
        for item in super().__iter__():
            self.tick()
            yield item

    def __getitem__(self, key):
        if isinstance(key, slice):
            self.tick(len(range(*key.indices(len(self)))))
        else:
            self.tick()
        return super().__getitem__(key)

    def __contains__(self, item):
        self.tick(len(self))
        return super().__contains__(item)

    def index(self, *args):
        self.tick(len(self))
        return super().index(*args)

    def count(self, item):
        self.tick(len(self))
        return super().count(item)


def check_pair(weights, target, got):
    if not isinstance(got, (tuple, list)) or len(got) != 2:
        raise CheckFailed(f"Two parts weigh {target} together, so pair_for should give back their positions, (i, j).", actual=repr(got))
    first, second = got
    if not (isinstance(first, int) and isinstance(second, int) and 0 <= first < second < len(weights)):
        raise CheckFailed("The positions should be two different places in the list, the smaller first.", actual=repr(got))
    if weights[first] + weights[second] != target:
        raise CheckFailed(f"Those two weigh {weights[first]} and {weights[second]}, not {target} together.", actual=repr(got))


def pair(weights, target):
    def check(ctx):
        module = ctx.module()
        check_pair(weights, target, module.pair_for(list(weights), target))
    return check


def big_pair(ctx):
    module = ctx.module()
    rng = _random.Random(13)
    plain = [rng.randint(1, 10_000) * 2 for _ in range(20_000)]
    plain[17_000] = 3
    plain[19_000] = 20_008
    weights = CountingList(plain, 60_000)
    try:
        got = module.pair_for(weights, 20_011)
    except TooMany:
        raise CheckFailed("Twenty thousand parts took more than 60,000 looks at a weight. Look at each one once, and remember what you've seen.")
    check_pair(plain, 20_011, got)


def true_islands(grid):
    visited = set()
    count = 0
    for row in range(len(grid)):
        for col in range(len(grid[row])):
            if grid[row][col] == "#" and (row, col) not in visited:
                count += 1
                visited.add((row, col))
                queue = _deque([(row, col)])
                while queue:
                    r, c = queue.popleft()
                    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                        if 0 <= nr < len(grid) and 0 <= nc < len(grid[nr]) and grid[nr][nc] == "#" and (nr, nc) not in visited:
                            visited.add((nr, nc))
                            queue.append((nr, nc))
    return count


def big_grid(ctx):
    module = ctx.module()
    rng = _random.Random(29)
    grid = ["".join("#" if rng.random() < 0.3 else "." for _ in range(60)) for _ in range(60)]
    got = module.islands(list(grid))
    expected = true_islands(grid)
    if got != expected:
        raise CheckFailed("A grid of 60 by 60 tiles, about a third of them #.", expected=expected, actual=got)


def piles_left_alone(ctx):
    module = ctx.module()
    piles = [[1, 4, 9], [2, 3], [5, 8, 10]]
    given = _copy.deepcopy(piles)
    module.merge_piles(given)
    if given != piles:
        raise CheckFailed("merge_piles should leave the piles as they were.", expected=piles, actual=given)


def big_piles(ctx):
    module = ctx.module()
    rng = _random.Random(31)
    piles = [sorted(rng.randint(1, 100_000) for _ in range(rng.randint(0, 3000))) for _ in range(6)]
    got = module.merge_piles(_copy.deepcopy(piles))
    expected = sorted(weight for pile in piles for weight in pile)
    if got != expected:
        raise CheckFailed("Six long piles merged into one, lightest first.", expected=f"{len(expected)} weights in order",
                          actual=f"{len(got)} weights" if isinstance(got, list) else repr(got))


TESTS = [
    function("Two parts for 23 kg", call="pair_for", args=([12, 7, 30, 4, 19], 23), expect=(3, 4), visible=True),
    function("Four count", call="islands", args=(["##..#", "#...#", "..#..", "##..."],), expect=4, visible=True),
    function("Three piles", call="merge_piles", args=([[1, 4, 9], [2, 3], [5, 8, 10]],), expect=[1, 2, 3, 4, 5, 8, 9, 10]),
    function("No pair", call="pair_for", args=([5, 11, 2], 9), expect=None,
             hint="When you've looked at every weight and found no partner, give back None."),
    function("Not the same part twice", call="pair_for", args=([9, 5], 18), expect=None,
             hint="A part can't be its own partner. Check for a partner before you remember the part."),
    custom("Two the same", pair([9, 5, 9], 18)),
    function("No parts", call="pair_for", args=([], 4), expect=None),
    custom("Several pairs", pair([3, 8, 5, 6, 2, 9], 11)),
    custom("Twenty thousand parts", big_pair,
           hint="A dictionary of weights you've already seen, and where, answers 'is its partner here?' without walking the list."),
    function("An empty grid", call="islands", args=([],), expect=0),
    function("No # at all", call="islands", args=(["....", "...."],), expect=0),
    function("All #", call="islands", args=(["###", "###"],), expect=1),
    function("Corners don't join", call="islands", args=(["#.", ".#"],), expect=2,
             hint="Only up, down, left and right join two # tiles. Diagonals don't."),
    function("A snake", call="islands", args=(["#####", "....#", "#####", "#....", "#####"],), expect=1),
    custom("A grid of 3,600 tiles", big_grid),
    function("No piles", call="merge_piles", args=([],), expect=[]),
    function("Empty piles", call="merge_piles", args=([[], [3, 7], []],), expect=[3, 7],
             hint="A pile with nothing in it adds nothing. Watch for it before looking at its first weight."),
    function("Repeats", call="merge_piles", args=([[2, 2, 5], [2, 4]],), expect=[2, 2, 2, 4, 5]),
    custom("The piles left alone", piles_left_alone),
    custom("Six long piles", big_piles),
]
