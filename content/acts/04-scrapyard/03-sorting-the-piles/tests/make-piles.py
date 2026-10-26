import ast as _ast
import random as _random


class TooManyComparisons(Exception):
    pass


class Weight:
    """A weight that counts every time it is compared with <, <=, > or >=."""

    comparisons = 0
    limit = None

    def __init__(self, kg):
        self.kg = kg

    def _counted(self):
        Weight.comparisons += 1
        if Weight.limit is not None and Weight.comparisons > Weight.limit:
            raise TooManyComparisons()

    def __lt__(self, other):
        self._counted()
        return self.kg < other.kg

    def __le__(self, other):
        self._counted()
        return self.kg <= other.kg

    def __gt__(self, other):
        self._counted()
        return self.kg > other.kg

    def __ge__(self, other):
        self._counted()
        return self.kg >= other.kg

    def __eq__(self, other):
        return isinstance(other, Weight) and self.kg == other.kg

    def __hash__(self):
        return hash(self.kg)

    def __repr__(self):
        return repr(self.kg)


class Pile(list):
    """A pile that counts every time a place in it is written to."""

    def __init__(self, weights):
        super().__init__(weights)
        self.writes = 0

    def __setitem__(self, index, value):
        self.writes += 1
        super().__setitem__(index, value)


def sorts(function_name, weights):
    def check(ctx):
        module = ctx.module()
        sort = getattr(module, function_name, None)
        if sort is None:
            raise CheckFailed(f"There is no function called {function_name}.")
        pile = list(weights)
        sort(pile)
        expected = sorted(weights)
        if pile != expected:
            shown = weights if len(weights) <= 12 else f"{len(weights)} weights"
            raise CheckFailed(f"After {function_name}({shown}), the pile should be in order, lightest first.",
                              expected=expected if len(expected) <= 12 else "in order",
                              actual=pile if len(pile) <= 12 else "not in order")
    return check


def random_pile(seed, count):
    pile_maker = _random.Random(seed)
    return [pile_maker.randint(1, 60) for _ in range(count)]


def one_swap_per_pass(ctx):
    module = ctx.module()
    pile = Pile(range(200, 0, -1))
    module.selection_sort(pile)
    if list(pile) != list(range(1, 201)):
        raise CheckFailed("selection_sort should sort 200 weights in reverse order.")
    if pile.writes > 400:
        raise CheckFailed(f"Sorting 200 weights wrote to the pile {pile.writes:,} times. Selection sort finds the lightest first, then makes one swap: at most two writes a pass.",
                          expected="400 or fewer", actual=pile.writes)


def quick_on_sorted(ctx):
    module = ctx.module()
    pile = [Weight(kg) for kg in range(2000)]
    Weight.comparisons = 0
    Weight.limit = 10_000
    try:
        module.insertion_sort(pile)
    except TooManyComparisons:
        raise CheckFailed("On 2,000 weights already in order, insertion_sort made more than 10,000 comparisons. It should need about one per weight.")
    finally:
        Weight.limit = None
    if [weight.kg for weight in pile] != list(range(2000)):
        raise CheckFailed("A pile already in order should stay in order.")


def returns_nothing(ctx):
    module = ctx.module()
    for name in ("selection_sort", "insertion_sort"):
        result = getattr(module, name)([3, 1, 2])
        if result is not None:
            raise CheckFailed(f"{name} should sort the list it's given and hand back None, like .sort().",
                              expected=None, actual=repr(result))


def by_hand(tree, source):
    for node in tree.body:
        if isinstance(node, _ast.FunctionDef):
            for inner in _ast.walk(node):
                if isinstance(inner, _ast.Call):
                    name = inner.func.attr if isinstance(inner.func, _ast.Attribute) else getattr(inner.func, "id", None)
                    if name in ("sorted", "sort"):
                        return f"{node.name} calls {name}(). Sort the pile by hand: the point is to see how it's done."


def draws_bars(ctx):
    got = ctx.module().draw([3, 12, 1])
    expected = "  3 ###\n 12 ############\n  1 #"
    if got != expected:
        raise CheckFailed("draw([3, 12, 1]) should give back three lines: each weight right-aligned in three places, a space, then its #s.",
                          expected=expected, actual=got)


def draws_nothing(ctx):
    got = ctx.module().draw([])
    if got != "":
        raise CheckFailed("An empty pile draws as an empty string.", expected="", actual=got)


def records(function_name, weights, expected):
    def check(ctx):
        sort = getattr(ctx.module(), function_name)
        frames = []
        pile = list(weights)
        sort(pile, frames)
        if frames != expected:
            raise CheckFailed(f"{function_name}({weights}, frames) should put a copy of the pile on frames after every pass.",
                              expected=expected, actual=frames)
        if len({id(frame) for frame in frames}) != len(frames) or any(frame is pile for frame in frames):
            raise CheckFailed("Each frame should be its own copy of the pile, list(weights), not the pile itself, or every frame ends up showing the last.")
    return check


def no_frames_asked(ctx):
    module = ctx.module()
    for name in ("selection_sort", "insertion_sort"):
        pile = [4, 2, 3]
        getattr(module, name)(pile)
        if pile != [2, 3, 4]:
            raise CheckFailed(f"{name} with no frames list should still sort the pile.", expected=[2, 3, 4], actual=pile)


TESTS = [
    custom("Selection sort, five weights", sorts("selection_sort", [5, 2, 8, 1, 9]), visible=True),
    custom("Insertion sort, five weights", sorts("insertion_sort", [7, 3, 9, 3, 1]), visible=True),
    custom("Selection sort, an empty pile", sorts("selection_sort", []),
           hint="An empty pile is already sorted. Make sure nothing in the loops reads a position that isn't there."),
    custom("Selection sort, one weight", sorts("selection_sort", [4])),
    custom("Selection sort, the same weight again and again", sorts("selection_sort", [4, 4, 1, 4, 1])),
    custom("Selection sort, already in order", sorts("selection_sort", [1, 2, 3, 4, 5, 6])),
    custom("Selection sort, back to front", sorts("selection_sort", [9, 7, 5, 3, 1])),
    custom("Selection sort, halves and below zero", sorts("selection_sort", [2.5, -1, 0, 2.5, -3])),
    custom("Selection sort, five hundred weights", sorts("selection_sort", random_pile(3, 500))),
    custom("Insertion sort, an empty pile", sorts("insertion_sort", []),
           hint="An empty pile is already sorted. range(1, 0) runs no passes at all."),
    custom("Insertion sort, one weight", sorts("insertion_sort", [4])),
    custom("Insertion sort, the same weight again and again", sorts("insertion_sort", [4, 4, 1, 4, 1]),
           hint="Slide a weight left only past weights that are heavier, not ones that weigh the same."),
    custom("Insertion sort, already in order", sorts("insertion_sort", [1, 2, 3, 4, 5, 6])),
    custom("Insertion sort, back to front", sorts("insertion_sort", [9, 7, 5, 3, 1]),
           hint="A weight may have to slide all the way to position 0. Stop at 0, not at 1."),
    custom("Insertion sort, halves and below zero", sorts("insertion_sort", [2.5, -1, 0, 2.5, -3])),
    custom("Insertion sort, five hundred weights", sorts("insertion_sort", random_pile(8, 500))),
    custom("Selection sort makes one swap a pass", one_swap_per_pass,
           hint="Find the position of the lightest first, with no swapping, and swap once at the end of the pass."),
    custom("Insertion sort is quick on a sorted pile", quick_on_sorted,
           hint="Stop sliding as soon as the weight on the left is no heavier. On a pile already in order, that's one comparison per weight."),
    custom("Both hand back None", returns_nothing,
           hint="Like .sort(), these change the list they're given. Leave out the return."),
    structure("Sorted by hand", check=by_hand),
    custom("A pile drawn as bars", draws_bars),
    custom("An empty pile drawn", draws_nothing),
    custom("Selection sort, frame by frame", records("selection_sort", [5, 2, 8, 1], [[1, 2, 8, 5], [1, 2, 8, 5], [1, 2, 5, 8]]),
           hint="Append list(weights) at the end of each pass of the outer loop, after the swap: one frame a pass, even when nothing moved."),
    custom("Insertion sort, frame by frame", records("insertion_sort", [5, 2, 8, 1], [[2, 5, 8, 1], [2, 5, 8, 1], [1, 2, 5, 8]]),
           hint="Append list(weights) once the weight is put down in the gap: one frame for each pass."),
    custom("No frames list, no frames", no_frames_asked,
           hint="frames=None means nobody is watching. Only append when frames is a list."),
]
