import ast as _ast

SMALL = [3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 30]


class Rack(list):
    """A rack that counts how many drawers get opened."""

    def __init__(self, sizes):
        super().__init__(sizes)
        self.opened = 0

    def __getitem__(self, index):
        if isinstance(index, slice):
            self.opened += len(range(*index.indices(len(self))))
        else:
            self.opened += 1
        return super().__getitem__(index)

    def __iter__(self):
        self.opened += len(self)
        return super().__iter__()

    def __contains__(self, item):
        self.opened += len(self)
        return super().__contains__(item)

    def index(self, *args):
        self.opened += len(self)
        return super().index(*args)

    def count(self, item):
        self.opened += len(self)
        return super().count(item)


def big_rack():
    # A million drawers: 0, 2, 4, ... 1,999,998 mm.
    return Rack(range(0, 2_000_000, 2))


def every_bolt(ctx):
    module = ctx.module()
    for drawer, size in enumerate(SMALL):
        got = module.find_bolt(SMALL, size)
        if got != drawer:
            raise CheckFailed(f"The {size} mm bolt is in drawer {drawer}.", expected=drawer, actual=got)


def duplicates(ctx):
    module = ctx.module()
    sizes = [5, 6, 6, 6, 6, 9]
    got = module.find_bolt(sizes, 6)
    if got not in (1, 2, 3, 4):
        raise CheckFailed("Any of the drawers holding a 6 mm bolt will do: 1, 2, 3 or 4.", expected="1, 2, 3 or 4", actual=got)


def million_found(ctx):
    module = ctx.module()
    rack = big_rack()
    got = module.find_bolt(rack, 1_234_568)
    if got != 617_284:
        raise CheckFailed("In a rack of 0, 2, 4 ... mm, the 1,234,568 mm bolt is in drawer 617,284.", expected=617_284, actual=got)
    if rack.opened > 60:
        raise CheckFailed(f"It opened {rack.opened:,} drawers. Binary search needs about twenty for a million.", expected="60 or fewer", actual=rack.opened)


def million_missing(ctx):
    module = ctx.module()
    rack = big_rack()
    got = module.find_bolt(rack, 1_234_567)
    if got != -1:
        raise CheckFailed("There are no odd sizes in this rack.", expected=-1, actual=got)
    if rack.opened > 60:
        raise CheckFailed(f"It opened {rack.opened:,} drawers to say no. Binary search needs about twenty for a million.", expected="60 or fewer", actual=rack.opened)


def million_between(ctx):
    module = ctx.module()
    rack = big_rack()
    got = module.count_between(rack, 1000, 1998)
    if got != 500:
        raise CheckFailed("From 1,000 to 1,998 mm in steps of 2 is 500 bolts.", expected=500, actual=got)
    if rack.opened > 100:
        raise CheckFailed(f"It opened {rack.opened:,} drawers. Two bisects need about forty.", expected="100 or fewer", actual=rack.opened)


def adds(sizes, size, drawer, after):
    def check(ctx):
        module = ctx.module()
        rack = list(sizes)
        got = module.add_bolt(rack, size)
        if rack != after:
            raise CheckFailed(f"After adding a {size} mm bolt to {sizes}, the rack should be {after}.", expected=after, actual=rack)
        if got != drawer:
            raise CheckFailed(f"The {size} mm bolt went into drawer {drawer}. add_bolt should give that back.", expected=drawer, actual=got)
    return check


def find_bolt_by_hand(tree, source):
    for node in tree.body:
        if isinstance(node, _ast.FunctionDef) and node.name == "find_bolt":
            has_while = any(isinstance(inner, _ast.While) for inner in _ast.walk(node))
            called = set()
            for inner in _ast.walk(node):
                if isinstance(inner, _ast.Call):
                    if isinstance(inner.func, _ast.Attribute):
                        called.add(inner.func.attr)
                    elif isinstance(inner.func, _ast.Name):
                        called.add(inner.func.id)
            if not has_while or called & {"bisect", "bisect_left", "bisect_right", "index"}:
                return "Write find_bolt's binary search yourself, with a while loop. bisect is for the other two."
            return None
    return "Define a function called find_bolt."


TESTS = [
    function("The 16 mm bolt", call="find_bolt", args=(SMALL, 16), expect=7, visible=True),
    function("Bolts from 6 to 10 mm", call="count_between", args=([4, 6, 6, 8, 10, 12], 6, 10), expect=4, visible=True),
    function("No 7 mm bolt", call="find_bolt", args=(SMALL, 7), expect=-1),
    function("The first drawer", call="find_bolt", args=(SMALL, 3), expect=0),
    function("The last drawer", call="find_bolt", args=(SMALL, 30), expect=10,
             hint="When low and high are the same drawer, there's still one left to open."),
    custom("Every bolt in the rack", every_bolt),
    function("Smaller than anything", call="find_bolt", args=(SMALL, 1), expect=-1),
    function("Bigger than anything", call="find_bolt", args=(SMALL, 40), expect=-1,
             hint="If only this fails, check that the search stops when low passes high, rather than reading past the end."),
    function("An empty rack", call="find_bolt", args=([], 8), expect=-1,
             hint="An empty rack has no drawers: -1, without opening anything."),
    function("One drawer, the right bolt", call="find_bolt", args=([8], 8), expect=0),
    function("One drawer, the wrong bolt", call="find_bolt", args=([8], 5), expect=-1),
    custom("A run of the same size", duplicates),
    custom("A million drawers, found in a handful", million_found,
           hint="Each look should throw away half of what's left. If it's opening thousands of drawers, it's searching one at a time."),
    custom("A million drawers, and it isn't there", million_missing),
    structure("find_bolt is written by hand", check=find_bolt_by_hand),
    function("Nothing in range", call="count_between", args=([4, 6, 8, 12], 9, 11), expect=0),
    function("The whole rack", call="count_between", args=([4, 6, 6, 8], 1, 100), expect=4),
    function("Ends that aren't in the rack", call="count_between", args=([4, 6, 6, 8, 10, 12], 5, 11), expect=4,
             hint="bisect_left for the low end and bisect_right for the high end work whether or not those sizes are in the rack."),
    function("Just one size", call="count_between", args=([4, 6, 6, 6, 8], 6, 6), expect=3),
    function("An empty rack, counted", call="count_between", args=([], 1, 10), expect=0),
    function("Low above high", call="count_between", args=([4, 6, 6, 8], 8, 4), expect=0,
             hint="If low is bigger than high, nothing is between them: 0, not a negative number."),
    custom("A million drawers, counted with bisect", million_between,
           hint="A loop over the rack opens every drawer. bisect_right(sizes, high) - bisect_left(sizes, low) opens about forty."),
    custom("Adding a bolt in the middle", adds([4, 6, 8], 7, 2, [4, 6, 7, 8])),
    custom("Adding a size that's already there", adds([4, 6, 6, 8], 6, 3, [4, 6, 6, 6, 8]),
           hint="A new bolt goes after any of the same size: bisect_right gives that drawer."),
    custom("Adding to an empty rack", adds([], 5, 0, [5])),
    custom("Adding the smallest", adds([4, 6], 2, 0, [2, 4, 6])),
    custom("Adding the biggest", adds([4, 6], 9, 2, [4, 6, 9])),
]
