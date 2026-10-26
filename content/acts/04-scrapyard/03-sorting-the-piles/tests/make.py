import ast as _ast
import random as _random

YARD = [("hubcap", 4), ("kettle-element", 2), ("spring-coil", 4), ("gear-12t", 1)]


class TooManyKeys(Exception):
    pass


def weight_of(part):
    return part[1]


def same(item):
    return item


def yard_by_weight(ctx):
    module = ctx.module()
    got = module.merge_sort(list(YARD), key=weight_of)
    expected = [("gear-12t", 1), ("kettle-element", 2), ("hubcap", 4), ("spring-coil", 4)]
    if got != expected:
        raise CheckFailed("Lightest first, and the two 4 kg parts in the order they arrived.", expected=expected, actual=got)


def merges(left, right, expected, key=same, message="The two piles merged into one, in order."):
    def check(ctx):
        module = ctx.module()
        left_copy, right_copy = list(left), list(right)
        got = module.merge(left_copy, right_copy, key=key)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
        if left_copy != list(left) or right_copy != list(right):
            raise CheckFailed("merge should build a new list and leave the two piles it was given as they were.")
    return check


def sorts(items, key=None, label=None):
    def check(ctx):
        module = ctx.module()
        given = list(items)
        got = module.merge_sort(given) if key is None else module.merge_sort(given, key=key)
        expected = sorted(items) if key is None else sorted(items, key=key)
        if got != expected:
            small = len(items) <= 12
            raise CheckFailed(f"merge_sort({label or items}) should hand back a new list, in order.",
                              expected=expected if small else f"{len(expected)} items in order",
                              actual=got if small or not isinstance(got, list) else f"{len(got)} items, not in that order")
    return check


def leaves_items_alone(ctx):
    module = ctx.module()
    items = [9, 3, 7, 1, 8]
    got = module.merge_sort(items)
    if items != [9, 3, 7, 1, 8]:
        raise CheckFailed("merge_sort should hand back a new list and leave the one it was given as it was.",
                          expected=[9, 3, 7, 1, 8], actual=items)
    if got != [1, 3, 7, 8, 9]:
        raise CheckFailed("merge_sort([9, 3, 7, 1, 8]) should be in order.", expected=[1, 3, 7, 8, 9], actual=got)


def every_tie_in_order(ctx):
    module = ctx.module()
    lorry = _random.Random(21)
    parts = [(f"part-{number}", lorry.randint(1, 5)) for number in range(300)]
    got = module.merge_sort(list(parts), key=weight_of)
    expected = sorted(parts, key=weight_of)
    if got != expected:
        raise CheckFailed("300 parts weighing 1 to 5 kg: lightest first, and parts of the same weight in the order they arrived.",
                          expected="stable order", actual="ties out of order" if sorted(got, key=weight_of) == expected else "not in order")


def n_log_n(ctx):
    module = ctx.module()
    lorry = _random.Random(5)
    parts = [(f"part-{number}", lorry.randint(1, 1000)) for number in range(4096)]
    calls = [0]

    def counted_weight(part):
        calls[0] += 1
        if calls[0] > 150_000:
            raise TooManyKeys()
        return part[1]

    try:
        got = module.merge_sort(list(parts), key=counted_weight)
    except TooManyKeys:
        raise CheckFailed("Sorting 4,096 parts called key more than 150,000 times. Merge sort compares about n log n times: around 50,000 here.")
    if got != sorted(parts, key=weight_of):
        raise CheckFailed("4,096 parts should come out lightest first, ties in the order they arrived.")


def by_hand(tree, source):
    for node in tree.body:
        if isinstance(node, _ast.FunctionDef):
            for inner in _ast.walk(node):
                if isinstance(inner, _ast.Call):
                    name = inner.func.attr if isinstance(inner.func, _ast.Attribute) else getattr(inner.func, "id", None)
                    if name in ("sorted", "sort"):
                        return f"{node.name} calls {name}(). Merge the piles yourself; sorted() is only for checking your answers in the main block."


def random_numbers(seed, count):
    lorry = _random.Random(seed)
    return [lorry.randint(-50, 500) for _ in range(count)]


def quick_sorts(items, key=None, label=None):
    def check(ctx):
        module = ctx.module()
        given = list(items)
        got = module.quick_sort(given) if key is None else module.quick_sort(given, key=key)
        expected = sorted(items) if key is None else sorted(items, key=key)
        if got != expected:
            small = len(items) <= 12
            raise CheckFailed(f"quick_sort({label or items}) should hand back a new list, in order.",
                              expected=expected if small else f"{len(expected)} items in order",
                              actual=got if small or not isinstance(got, list) else f"{len(got)} items, not in that order")
        if given != list(items):
            raise CheckFailed("quick_sort should leave the list it was given as it was.")
    return check


def quick_ties(ctx):
    module = ctx.module()
    lorry = _random.Random(34)
    parts = [(f"part-{number}", lorry.randint(1, 5)) for number in range(300)]
    got = module.quick_sort(list(parts), key=weight_of)
    if got != sorted(parts, key=weight_of):
        raise CheckFailed("300 parts weighing 1 to 5 kg: lightest first, and parts of the same weight in the order they arrived.",
                          expected="stable order", actual="ties out of order" if sorted(got, key=weight_of) == sorted(parts, key=weight_of) else "not in order")


PILE = [7, 3, 9, 3, 1, 12, 5]
MERGE_FRAMES = [[3, 7, 3, 9, 1, 12, 5], [3, 3, 7, 9, 1, 5, 12], [1, 3, 3, 5, 7, 9, 12]]
QUICK_FRAMES = [[3, 3, 1, 5, 7, 9, 12], [1, 3, 3, 5, 7, 9, 12]]


def frames_of(function_name, expected):
    def check(ctx):
        frames = []
        getattr(ctx.module(), function_name)(list(PILE), frames=frames)
        if frames != expected:
            raise CheckFailed(f"{function_name}({PILE}, frames=frames) should put the piles, laid end to end, on frames after every round.",
                              expected=expected, actual=frames)
        if len({id(frame) for frame in frames}) != len(frames):
            raise CheckFailed("Each frame should be a new list, made when the round ends.")
    return check


def no_frames_asked(ctx):
    module = ctx.module()
    for name in ("merge_sort", "quick_sort"):
        got = getattr(module, name)([4, 2, 3])
        if got != [2, 3, 4]:
            raise CheckFailed(f"{name} with no frames list should still sort.", expected=[2, 3, 4], actual=got)


def quick_by_rounds(ctx):
    module = ctx.module()
    frames = []
    module.quick_sort([5, 5, 5, 5], frames=frames)
    if len(frames) != 1:
        raise CheckFailed("Four parts that weigh the same are finished after one round: each is a pile of one.",
                          expected="1 frame", actual=f"{len(frames)} frames")


TESTS = [
    function("Five weights", call="merge_sort", args=([5, 2, 8, 1, 9],), expect=[1, 2, 5, 8, 9], visible=True),
    custom("Nell's yard, by weight", yard_by_weight,
           hint="Compare key(part), not the parts themselves, and on a tie take from the left pile."),
    custom("Merging two piles", merges([2, 5, 9], [1, 5, 6, 12], [1, 2, 5, 5, 6, 9, 12])),
    custom("Merging with an empty pile on the left", merges([], [3, 4], [3, 4]),
           hint="When one pile runs out, everything left in the other goes on the end."),
    custom("Merging with an empty pile on the right", merges([1, 2], [], [1, 2])),
    custom("Merging a tie by key", merges([("hubcap", 4)], [("anvil", 4)], [("hubcap", 4), ("anvil", 4)], key=weight_of,
                                          message="On a tie, the part from the left pile comes first."),
           hint="Use <= when comparing the two front parts, so a tie goes to the left pile."),
    custom("Merging everything left over", merges([1, 2, 3, 10, 11], [4, 5], [1, 2, 3, 4, 5, 10, 11]),
           hint="After the loop, tip what's left of both piles on the end."),
    function("An empty pile", call="merge_sort", args=([],), expect=[],
             hint="No items, no piles. Hand back an empty list."),
    function("One part", call="merge_sort", args=([7],), expect=[7]),
    custom("The same weight again and again", sorts([4, 1, 4, 1, 4])),
    custom("Already in order", sorts(list(range(1, 11)))),
    custom("Back to front", sorts(list(range(10, 0, -1)))),
    custom("Seven parts, so one pile is left over", sorts([9, 3, 7, 1, 8, 2, 5]),
           hint="With an odd number of piles, the last one has no partner this round. Carry it through to the next."),
    custom("Names, in alphabetical order", sorts(["valve-brass", "anvil-small", "gear-12t", "bike-bell"])),
    custom("The pile it's given stays as it was", leaves_items_alone),
    custom("Every tie kept in order", every_tie_in_order,
           hint="Merge neighbouring piles, left with right, and take from the left on a tie. Then ties never swap places."),
    custom("Five thousand weights", sorts(random_numbers(17, 5000), label="5,000 weights")),
    custom("Four thousand parts, n log n", n_log_n,
           hint="Each round should merge every pile once. If parts are being compared with every other part, it isn't merge sort."),
    structure("Merged by hand", check=by_hand),
    custom("Quick sort, five weights", quick_sorts([5, 2, 8, 1, 9])),
    custom("Quick sort, Nell's yard by weight", quick_sorts(YARD, key=weight_of, label="the yard"),
           hint="Compare key(item) with the pivot's key, and keep lighter, same and heavier each in the order they came."),
    custom("Quick sort, an empty pile", quick_sorts([]), hint="No items: hand back an empty list, after no rounds at all."),
    custom("Quick sort, one part", quick_sorts([7])),
    custom("Quick sort, the same weight again and again", quick_sorts([4, 1, 4, 1, 4]),
           hint="Parts that weigh the same as the pivot are finished: each becomes a pile of one, in the order they came."),
    custom("Quick sort, already in order", quick_sorts(list(range(1, 11)))),
    custom("Quick sort, back to front", quick_sorts(list(range(10, 0, -1)))),
    custom("Quick sort, every tie kept in order", quick_ties),
    custom("Quick sort, five thousand weights", quick_sorts(random_numbers(23, 5000), label="5,000 weights")),
    custom("Merge sort, round by round", frames_of("merge_sort", MERGE_FRAMES), visible=True,
           hint="After each round of merging, append every pile laid end to end: [item for pile in piles for item in pile]."),
    custom("Quick sort, round by round", frames_of("quick_sort", QUICK_FRAMES),
           hint="Each round splits every pile of two or more round its first part, then the piles, end to end, go on frames."),
    custom("A round that finishes everything", quick_by_rounds),
    custom("No frames list, no frames", no_frames_asked, hint="Only append when frames is a list."),
    output("Watching quick sort", inputs=["quick"], match="contains",
           expect="Step 2\n  1 #\n  3 ###\n  3 ###\n  5 #####\n  7 #######\n  9 #########\n 12 ############\nQuick sort: 2 steps"),
    output("Watching merge sort", inputs=["merge"], match="contains", expect="Merge sort: 3 steps"),
    output("The pier lot agrees", inputs=["merge"], match="contains", expect="merge and quick agree with sorted(): True",
           hint="Both sorts, on ten thousand (name, kg) parts by weight, should give exactly what sorted() gives, ties and all."),
]
