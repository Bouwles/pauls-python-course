import ast as _ast
import random as _random

FEW_LAPS = [("Caitlin", 4), ("Neil", 2), ("Yahya", 4), ("Riya", 1)]


class TooManyKeys(Exception):
    pass


def tenths_of(lap):
    return lap[1]


def same(item):
    return item


def few_by_time(ctx):
    module = ctx.module()
    got = module.merge_sort(list(FEW_LAPS), key=tenths_of)
    expected = [("Riya", 1), ("Neil", 2), ("Caitlin", 4), ("Yahya", 4)]
    if got != expected:
        raise CheckFailed("Fastest first, and the two laps at four tenths in the order they were set.", expected=expected, actual=got)


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
    timing = _random.Random(21)
    laps = [(f"lap-{number}", timing.randint(1, 5)) for number in range(300)]
    got = module.merge_sort(list(laps), key=tenths_of)
    expected = sorted(laps, key=tenths_of)
    if got != expected:
        raise CheckFailed("300 laps, 1 to 5 tenths off the record: fastest first, and laps with the same time in the order they were set.",
                          expected="stable order", actual="ties out of order" if sorted(got, key=tenths_of) == expected else "not in order")


def n_log_n(ctx):
    module = ctx.module()
    timing = _random.Random(5)
    laps = [(f"lap-{number}", timing.randint(1, 1000)) for number in range(4096)]
    calls = [0]

    def counted_tenths(lap):
        calls[0] += 1
        if calls[0] > 150_000:
            raise TooManyKeys()
        return lap[1]

    try:
        got = module.merge_sort(list(laps), key=counted_tenths)
    except TooManyKeys:
        raise CheckFailed("Sorting 4,096 laps called key more than 150,000 times. Merge sort compares about n log n times: around 50,000 here.")
    if got != sorted(laps, key=tenths_of):
        raise CheckFailed("4,096 laps should come out fastest first, ties in the order they were set.")


def by_hand(tree, source):
    for node in tree.body:
        if isinstance(node, _ast.FunctionDef):
            for inner in _ast.walk(node):
                if isinstance(inner, _ast.Call):
                    name = inner.func.attr if isinstance(inner.func, _ast.Attribute) else getattr(inner.func, "id", None)
                    if name in ("sorted", "sort"):
                        return f"{node.name} calls {name}(). Merge the piles yourself; sorted() is only for checking your answers in the main block."


def random_numbers(seed, count):
    timing = _random.Random(seed)
    return [timing.randint(-50, 500) for _ in range(count)]


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
    timing = _random.Random(34)
    laps = [(f"lap-{number}", timing.randint(1, 5)) for number in range(300)]
    got = module.quick_sort(list(laps), key=tenths_of)
    if got != sorted(laps, key=tenths_of):
        raise CheckFailed("300 laps, 1 to 5 tenths off the record: fastest first, and laps with the same time in the order they were set.",
                          expected="stable order", actual="ties out of order" if sorted(got, key=tenths_of) == sorted(laps, key=tenths_of) else "not in order")


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
        raise CheckFailed("Four laps with the same time are finished after one round: each is a pile of one.",
                          expected="1 frame", actual=f"{len(frames)} frames")


TESTS = [
    function("Five laps", call="merge_sort", args=([5, 2, 8, 1, 9],), expect=[1, 2, 5, 8, 9], visible=True),
    custom("A few laps, by time", few_by_time,
           hint="Compare key(lap), not the laps themselves, and on a tie take from the left pile."),
    custom("Merging two piles", merges([2, 5, 9], [1, 5, 6, 12], [1, 2, 5, 5, 6, 9, 12])),
    custom("Merging with an empty pile on the left", merges([], [3, 4], [3, 4]),
           hint="When one pile runs out, everything left in the other goes on the end."),
    custom("Merging with an empty pile on the right", merges([1, 2], [], [1, 2])),
    custom("Merging a tie by key", merges([("Caitlin", 4)], [("Aaesha", 4)], [("Caitlin", 4), ("Aaesha", 4)], key=tenths_of,
                                          message="On a tie, the lap from the left pile comes first."),
           hint="Use <= when comparing the two front laps, so a tie goes to the left pile."),
    custom("Merging everything left over", merges([1, 2, 3, 10, 11], [4, 5], [1, 2, 3, 4, 5, 10, 11]),
           hint="After the loop, tip what's left of both piles on the end."),
    function("An empty pile", call="merge_sort", args=([],), expect=[],
             hint="No items, no piles. Hand back an empty list."),
    function("One lap", call="merge_sort", args=([7],), expect=[7]),
    custom("The same time again and again", sorts([4, 1, 4, 1, 4])),
    custom("Already in order", sorts(list(range(1, 11)))),
    custom("Back to front", sorts(list(range(10, 0, -1)))),
    custom("Seven laps, so one pile is left over", sorts([9, 3, 7, 1, 8, 2, 5]),
           hint="With an odd number of piles, the last one has no partner this round. Carry it through to the next."),
    custom("Circuits, in alphabetical order", sorts(["Suzuka", "Monza", "Silverstone", "Imola"])),
    custom("The pile it's given stays as it was", leaves_items_alone),
    custom("Every tie kept in order", every_tie_in_order,
           hint="Merge neighbouring piles, left with right, and take from the left on a tie. Then ties never swap places."),
    custom("Five thousand laps", sorts(random_numbers(17, 5000), label="5,000 laps")),
    custom("Four thousand laps, n log n", n_log_n,
           hint="Each round should merge every pile once. If laps are being compared with every other lap, it isn't merge sort."),
    structure("Merged by hand", check=by_hand),
    custom("Quick sort, five laps", quick_sorts([5, 2, 8, 1, 9])),
    custom("Quick sort, a few laps by time", quick_sorts(FEW_LAPS, key=tenths_of, label="a few laps"),
           hint="Compare key(item) with the pivot's key, and keep faster, same and slower each in the order they came."),
    custom("Quick sort, an empty pile", quick_sorts([]), hint="No items: hand back an empty list, after no rounds at all."),
    custom("Quick sort, one lap", quick_sorts([7])),
    custom("Quick sort, the same time again and again", quick_sorts([4, 1, 4, 1, 4]),
           hint="Laps with the same time as the pivot are finished: each becomes a pile of one, in the order they came."),
    custom("Quick sort, already in order", quick_sorts(list(range(1, 11)))),
    custom("Quick sort, back to front", quick_sorts(list(range(10, 0, -1)))),
    custom("Quick sort, every tie kept in order", quick_ties),
    custom("Quick sort, five thousand laps", quick_sorts(random_numbers(23, 5000), label="5,000 laps")),
    custom("Merge sort, round by round", frames_of("merge_sort", MERGE_FRAMES), visible=True,
           hint="After each round of merging, append every pile laid end to end: [item for pile in piles for item in pile]."),
    custom("Quick sort, round by round", frames_of("quick_sort", QUICK_FRAMES),
           hint="Each round splits every pile of two or more round its first lap, then the piles, end to end, go on frames."),
    custom("A round that finishes everything", quick_by_rounds),
    custom("No frames list, no frames", no_frames_asked, hint="Only append when frames is a list."),
    output("Watching quick sort", inputs=["quick"], match="contains",
           expect="Step 2\n  1 #\n  3 ###\n  3 ###\n  5 #####\n  7 #######\n  9 #########\n 12 ############\nQuick sort: 2 steps"),
    output("Watching merge sort", inputs=["merge"], match="contains", expect="Merge sort: 3 steps"),
    output("The sim league agrees", inputs=["merge"], match="contains", expect="merge and quick agree with sorted(): True",
           hint="Both sorts, on ten thousand (driver, tenths) laps by time, should give exactly what sorted() gives, ties and all."),
]
