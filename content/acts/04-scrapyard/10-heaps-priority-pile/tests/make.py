import ast as _ast
import random as _random


class TooManyComparisons(Exception):
    pass


class Part:
    """A part that counts every time it is compared."""

    compared = 0
    limit = None

    def __init__(self, kg):
        self.kg = kg

    def _tick(self):
        Part.compared += 1
        if Part.limit is not None and Part.compared > Part.limit:
            raise TooManyComparisons()

    def __lt__(self, other):
        self._tick()
        return self.kg < other.kg

    def __le__(self, other):
        self._tick()
        return self.kg <= other.kg

    def __gt__(self, other):
        self._tick()
        return self.kg > other.kg

    def __ge__(self, other):
        self._tick()
        return self.kg >= other.kg

    def __eq__(self, other):
        self._tick()
        return isinstance(other, Part) and self.kg == other.kg

    __hash__ = object.__hash__

    def __repr__(self):
        return f"Part({self.kg})"


class Priority(int):
    """A priority number that counts every time it is compared."""

    compared = 0
    limit = None

    def _tick(self):
        Priority.compared += 1
        if Priority.limit is not None and Priority.compared > Priority.limit:
            raise TooManyComparisons()

    def __lt__(self, other):
        self._tick()
        return int(self) < int(other)

    def __le__(self, other):
        self._tick()
        return int(self) <= int(other)

    def __gt__(self, other):
        self._tick()
        return int(self) > int(other)

    def __ge__(self, other):
        self._tick()
        return int(self) >= int(other)

    def __eq__(self, other):
        self._tick()
        return int(self) == int(other)

    __hash__ = int.__hash__


def is_heap(items):
    return all(items[(position - 1) // 2] <= items[position] for position in range(1, len(items)))


def broken_at(items):
    for position in range(1, len(items)):
        if items[(position - 1) // 2] > items[position]:
            return position
    return None


def pushes(numbers, message):
    def check(ctx):
        module = ctx.module()
        heap = []
        for count, number in enumerate(numbers, start=1):
            module.push(heap, number)
            if sorted(heap) != sorted(numbers[:count]):
                raise CheckFailed(f"After pushing {numbers[:count]}, the heap should hold exactly those.", expected=sorted(numbers[:count]), actual=heap)
            position = broken_at(heap)
            if position is not None:
                raise CheckFailed(f"{message} After pushing {numbers[:count]}, position {position} holds {heap[position]}, smaller than its parent at {(position - 1) // 2}.",
                                  actual=heap)
    return check


def pops_in_order(numbers, message):
    def check(ctx):
        module = ctx.module()
        heap = []
        for number in numbers:
            module.push(heap, number)
        taken = []
        while heap:
            taken.append(module.pop(heap))
            position = broken_at(heap)
            if position is not None:
                raise CheckFailed(f"After a pop, position {position} holds {heap[position]}, smaller than its parent. The last item didn't sink far enough.",
                                  actual=heap)
            if len(taken) > len(numbers):
                raise CheckFailed("pop handed back more items than went in. Does it remove the item it hands back?")
        if taken != sorted(numbers):
            raise CheckFailed(message, expected=sorted(numbers), actual=taken)
    return check


def first_push(ctx):
    module = ctx.module()
    heap = []
    module.push(heap, 7)
    if heap != [7]:
        raise CheckFailed("Pushing 7 onto an empty heap gives [7].", expected=[7], actual=heap)


def empty_pop(ctx):
    module = ctx.module()
    try:
        got = module.pop([])
    except IndexError:
        return
    raise CheckFailed("Popping an empty heap should raise IndexError, as heappop does.", expected="IndexError", actual=repr(got))


def last_one(ctx):
    module = ctx.module()
    heap = [4]
    got = module.pop(heap)
    if got != 4 or heap != []:
        raise CheckFailed("Popping the only item hands it back and leaves the heap empty.", expected=(4, []), actual=(got, heap))


def one_child(ctx):
    module = ctx.module()
    heap = [1, 2, 3, 4, 5]
    got = module.pop(heap)
    if got != 1:
        raise CheckFailed("pop should hand back the smallest, 1.", expected=1, actual=got)
    if heap != [2, 4, 3, 5]:
        raise CheckFailed("After popping 1 from [1, 2, 3, 4, 5], the 5 sinks past the 2, then past the 4, which is its only child down there.",
                          expected=[2, 4, 3, 5], actual=heap)


def counted(ctx):
    module = ctx.module()
    rng = _random.Random(9)
    weights = [rng.randint(1, 10_000) for _ in range(1000)]
    parts = [Part(kg) for kg in weights]
    heap = []
    Part.compared = 0
    Part.limit = 60_000
    try:
        for part in parts:
            module.push(heap, part)
        pushed = Part.compared
        taken = [module.pop(heap) for _ in range(len(parts))]
    except TooManyComparisons:
        raise CheckFailed("A thousand pushes and a thousand pops made more than 60,000 comparisons. Is something looking at every part, like sort() or min()?")
    finally:
        Part.limit = None
    if [part.kg for part in taken] != sorted(weights):
        raise CheckFailed("A thousand parts should come out lightest first.")
    if pushed > 15_000:
        raise CheckFailed("A thousand pushes made more than 15,000 comparisons. Each push should only climb, comparing with one parent per level.",
                          expected="at most 15,000", actual=pushed)


HEAPQ_NAMES = {"heappush", "heappop", "heapify", "heapreplace", "heappushpop", "nsmallest", "nlargest", "sort", "sorted"}


def by_hand(ctx):
    for node in _ast.walk(ctx.tree):
        if isinstance(node, _ast.Import) and any(alias.name == "heapq" for alias in node.names):
            raise CheckFailed("scheduler.py imports heapq. Build the heap yourself: the scheduler is yours.")
        if isinstance(node, _ast.ImportFrom) and node.module == "heapq":
            raise CheckFailed("scheduler.py imports from heapq. Build the heap yourself: the scheduler is yours.")
    for node in _ast.walk(ctx.tree):
        if isinstance(node, _ast.FunctionDef) and node.name in ("push", "pop"):
            for inner in _ast.walk(node):
                if isinstance(inner, _ast.Call):
                    name = inner.func.attr if isinstance(inner.func, _ast.Attribute) else getattr(inner.func, "id", "")
                    if name in HEAPQ_NAMES:
                        raise CheckFailed(f"{node.name} calls {name}(). Climb and sink by hand: that's the whole trick.")


def replay(module, events):
    pile = module.TaskScheduler()
    taken = []
    for event in events:
        if event[0] == "add":
            pile.add(event[1], event[2])
        else:
            taken.append(pile.take())
    return pile, taken


def repairs(events, expected, message):
    def check(ctx):
        module = ctx.module()
        _pile, taken = replay(module, events)
        if taken != expected:
            raise CheckFailed(message, expected=expected, actual=taken)
    return check


def waiting_count(ctx):
    module = ctx.module()
    pile, _taken = replay(module, [("add", "a kettle", 2), ("add", "a hinge", 5), ("add", "a gate", 2), ("take",)])
    if len(pile) != 2:
        raise CheckFailed("Three repairs added and one taken leaves two waiting.", expected=2, actual=len(pile))
    fresh = module.TaskScheduler()
    if len(fresh) != 0:
        raise CheckFailed("A new pile has nothing waiting.", expected=0, actual=len(fresh))


def empty_take(ctx):
    module = ctx.module()
    pile = module.TaskScheduler()
    try:
        got = pile.take()
    except IndexError:
        return
    raise CheckFailed("Taking from an empty pile should raise IndexError.", expected="IndexError", actual=repr(got))


def busy_day(ctx):
    module = ctx.module()
    rng = _random.Random(4)
    pile = module.TaskScheduler()
    arrivals = [(f"repair {number}", rng.randint(1, 5)) for number in range(2000)]
    Priority.compared = 0
    Priority.limit = 300_000
    try:
        for repair, priority in arrivals:
            pile.add(repair, Priority(priority))
        taken = [pile.take() for _ in range(len(arrivals))]
    except TooManyComparisons:
        raise CheckFailed("Two thousand repairs made more than 300,000 comparisons of priorities. Is take() looking through every repair waiting?")
    finally:
        Priority.limit = None
    expected = [repair for repair, _priority in sorted(arrivals, key=lambda arrival: arrival[1])]
    if taken != expected:
        wrong = next(index for index, (got, want) in enumerate(zip(taken, expected)) if got != want)
        raise CheckFailed(f"Two thousand repairs, lowest priority number first and ties in the order they came. Repair number {wrong} taken was wrong.",
                          expected=expected[wrong], actual=taken[wrong])


HEADPHONES_FIRST = [("add", "Riya's headphones", 3), ("add", "Paul's desk lamp", 3), ("add", "the arcade cabinet", 1),
               ("take",), ("take",), ("take",)]

URGENT_FIRST = [("add", "the Studio kettle", 4), ("add", "Neil's keyboard", 2), ("add", "Yahya's stopwatch", 1),
                ("add", "a bike pump", 3), ("take",), ("take",), ("take",), ("take",)]

MIXED = [("add", "the printer", 3), ("add", "a bike light", 3), ("take",), ("add", "the arcade cabinet", 1),
         ("add", "a desk fan", 3), ("take",), ("take",), ("add", "a phone charger", 2), ("take",), ("take",)]

_RNG = _random.Random(3)
SIXTY = [_RNG.randint(1, 99) for _ in range(60)]
TWO_HUNDRED = [_RNG.randint(1, 999) for _ in range(200)]

TUESDAY = """Mending the arcade cabinet
Mending Neil's keyboard
Mending Riya's headphones
Mending Yahya's stopwatch
Mending Aaesha's label printer
Mending Paul's desk lamp
Still waiting: 1"""

TESTS = [
    custom("Pushing 5, 2, 8 and 1", pushes([5, 2, 8, 1], "No item should be smaller than its parent."), visible=True),
    output("Caitlin's Tuesday", expect=TUESDAY, visible=True),
    custom("Popping hands back the smallest each time", pops_in_order([5, 2, 8, 1, 9, 3], "Six pops should give 1, 2, 3, 5, 8, 9.")),
    custom("The first push", first_push),
    custom("Every push keeps the rule", pushes(SIXTY, "No item should be smaller than its parent."),
           hint="A pushed item climbs while it's smaller than its parent, at (position - 1) // 2, and stops as soon as it isn't."),
    custom("Popping an empty heap", empty_pop,
           hint="heap[0] on an empty list raises IndexError for you. Make sure nothing catches it."),
    custom("Popping the last one", last_one,
           hint="When the item you remove was the only one, there's nothing to move to the top."),
    custom("A child on one side only", one_child,
           hint="An item can have a child at 2 * position + 1 and none at 2 * position + 2. Check each child against len(heap) on its own."),
    custom("Repeats", pops_in_order([4, 4, 1, 4, 1], "Repeats come out together: 1, 1, 4, 4, 4.")),
    custom("Pairs compare item by item", pops_in_order([(2, "b"), (1, "z"), (2, "a")], "Tuples compare by their first item, then the next.")),
    custom("Every pop keeps the rule", pops_in_order(TWO_HUNDRED, "Two hundred numbers should come out smallest first."),
           hint="A sinking item swaps with the smaller of its children. Swap with the bigger one and the smaller ends up above it."),
    custom("A thousand parts, counted", counted, timeout=10,
           hint="Climbing and sinking each compare one level at a time: about ten levels for a thousand parts. sort(), min() and remove() all look at every part."),
    custom("Built by hand", by_hand),
    custom("The most urgent first", repairs(URGENT_FIRST, ["Yahya's stopwatch", "Neil's keyboard", "a bike pump", "the Studio kettle"],
                                            "Priority 1, then 2, then 3, then 4.")),
    custom("The headphones were in first", repairs(HEADPHONES_FIRST, ["the arcade cabinet", "Riya's headphones", "Paul's desk lamp"],
                                                   "The cabinet first. Then the headphones and the lamp tie on 3, and the headphones came in first."),
           hint="Ties go to whoever came in first. Put an arrival count between the priority and the repair."),
    custom("Taking while they come in", repairs(MIXED, ["the printer", "the arcade cabinet", "a bike light", "a phone charger", "a desk fan"],
                                                "The printer, the cabinet as soon as it arrives, the bike light, the charger at 2, then the fan.")),
    custom("Counting what's waiting", waiting_count),
    custom("An empty pile", empty_take),
    custom("Two thousand repairs, counted", busy_day, timeout=10,
           hint="take() should be one pop from your heap, not a look through every repair waiting."),
]
