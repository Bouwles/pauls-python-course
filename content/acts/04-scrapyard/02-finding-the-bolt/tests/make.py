import ast as _ast

SMALL = ["anvil-small", "bell-ship", "bolt-M10", "bolt-M12", "bolt-M8", "gear-12t", "gear-24t",
         "hinge-brass", "hubcap", "valve-brass", "winch-handle"]


class Book(list):
    """A parts list that counts every name looked at."""

    def __init__(self, names):
        super().__init__(names)
        self.looked = 0

    def __getitem__(self, index):
        if isinstance(index, slice):
            self.looked += len(range(*index.indices(len(self))))
        else:
            self.looked += 1
        return super().__getitem__(index)

    def __iter__(self):
        self.looked += len(self)
        return super().__iter__()

    def __contains__(self, item):
        self.looked += len(self)
        return super().__contains__(item)

    def index(self, *args):
        self.looked += len(self)
        return super().index(*args)

    def count(self, item):
        self.looked += len(self)
        return super().count(item)


def big_book():
    # A million names, part-0000000 to part-0999999, already in order.
    return Book(f"part-{number:07d}" for number in range(1_000_000))


def reference_find(parts, name):
    low, high, looks = 0, len(parts) - 1, 0
    while low <= high:
        middle = (low + high) // 2
        looks += 1
        if parts[middle] == name:
            return middle, looks
        if parts[middle] < name:
            low = middle + 1
        else:
            high = middle - 1
    return -1, looks


def the_book(ctx):
    return sorted(line.strip() for line in ctx.files["parts.txt"].splitlines() if line.strip())


def every_part(ctx):
    module = ctx.module()
    for name in SMALL:
        got = module.find_part(SMALL, name)
        expected = reference_find(SMALL, name)
        if tuple(got) != expected:
            raise CheckFailed(f"find_part(parts, {name!r}) should give back its position and the looks it took.",
                              expected=expected, actual=got)


def the_whole_book(ctx):
    module = ctx.module()
    parts = the_book(ctx)
    for name in parts:
        got = module.find_part(parts, name)
        if tuple(got) != reference_find(parts, name):
            raise CheckFailed(f"In the parts list, find_part for {name!r} is wrong.", expected=reference_find(parts, name), actual=got)


def million_found(ctx):
    module = ctx.module()
    book = big_book()
    position, looks = module.find_part(book, "part-0617284")
    if position != 617_284:
        raise CheckFailed("part-0617284 is at position 617,284.", expected=617_284, actual=position)
    if book.looked > 60:
        raise CheckFailed(f"It looked at {book.looked:,} names. Binary search needs about twenty for a million.",
                          expected="60 or fewer", actual=book.looked)
    if looks > 21:
        raise CheckFailed("The looks it reports should be the names it looked at: about twenty.", expected="20 or 21", actual=looks)


def million_missing(ctx):
    module = ctx.module()
    book = big_book()
    position, looks = module.find_part(book, "part-0617284b")
    if position != -1:
        raise CheckFailed("There's no part-0617284b.", expected=-1, actual=position)
    if book.looked > 60:
        raise CheckFailed(f"It looked at {book.looked:,} names to say no. Binary search needs about twenty.",
                          expected="60 or fewer", actual=book.looked)


def find_part_by_hand(tree, source):
    for node in tree.body:
        if isinstance(node, _ast.FunctionDef) and node.name == "find_part":
            has_while = any(isinstance(inner, _ast.While) for inner in _ast.walk(node))
            called = set()
            for inner in _ast.walk(node):
                if isinstance(inner, _ast.Call):
                    if isinstance(inner.func, _ast.Attribute):
                        called.add(inner.func.attr)
                    elif isinstance(inner.func, _ast.Name):
                        called.add(inner.func.id)
            if not has_while or called & {"bisect", "bisect_left", "bisect_right", "index"}:
                return "Write find_part's binary search yourself, with a while loop. bisect is for starting_with and add_part."
            return None
    return "Define a function called find_part."


def million_prefix(ctx):
    module = ctx.module()
    book = big_book()
    got = module.starting_with(book, "part-012345")
    expected = [f"part-{number:07d}" for number in range(123_450, 123_460)]
    if list(got) != expected:
        raise CheckFailed("Ten names start with part-012345.", expected=expected, actual=got)
    if book.looked > 100:
        raise CheckFailed(f"It looked at {book.looked:,} names. bisect finds where they start in about twenty, then there are ten.",
                          expected="100 or fewer", actual=book.looked)


def containing_all(ctx):
    module = ctx.module()
    book = Book(SMALL)
    names, looks = module.containing(book, "brass")
    if list(names) != ["hinge-brass", "valve-brass"] or looks != len(SMALL):
        raise CheckFailed("Two names have brass in them, and finding them means looking at all eleven.",
                          expected=(["hinge-brass", "valve-brass"], 11), actual=(names, looks))


def adds(names, name, position, after):
    def check(ctx):
        module = ctx.module()
        parts = list(names)
        got = module.add_part(parts, name)
        if parts != after:
            raise CheckFailed(f"After add_part(parts, {name!r}) on {names}, the list should be {after}.", expected=after, actual=parts)
        if got != position:
            raise CheckFailed(f"{name} is at position {position}. add_part should give that back.", expected=position, actual=got)
    return check


def search_line(query, expected, names=None):
    def check(ctx):
        module = ctx.module()
        parts = list(SMALL if names is None else names)
        got = module.search(parts, query)
        if got != expected:
            raise CheckFailed(f"search(parts, {query!r}) gives the wrong line.", expected=expected, actual=got)
    return check


def book_search(ctx):
    search_line("bolt-M1*", "bolt-M1*: 5 parts: bolt-M10, bolt-M10-brass, bolt-M12, bolt-M12-brass, bolt-M16", the_book(ctx))(ctx)


def add_then_find(ctx):
    module = ctx.module()
    parts = list(SMALL)
    first = module.search(parts, "+gear-16t")
    second = module.search(parts, "gear-*")
    if first != "gear-16t: added as part 6" or second != "gear-*: 3 parts: gear-12t, gear-16t, gear-24t":
        raise CheckFailed("A part added with + should be there for the next search.",
                          expected="gear-16t: added as part 6, then gear-*: 3 parts: gear-12t, gear-16t, gear-24t",
                          actual=f"{first}, then {second}")


SESSION = """Parts list: 188 parts, anchor-chain to wireless-dial
A name, the start of one with *, or +name to add one. Blank to stop.
valve-brass: part 159, found in 7 looks
bolt-M1*: 5 parts: bolt-M10, bolt-M10-brass, bolt-M12, bolt-M12-brass, bolt-M16
piston: no part by that name, and none with it in the name (188 looks)"""

TESTS = [
    function("valve-brass in the small list", call="find_part", args=(SMALL, "valve-brass"), expect=(9, 3), visible=True),
    custom("A search on the parts list", book_search, visible=True),
    function("No such part", call="find_part", args=(SMALL, "piston"), expect=(-1, 3)),
    function("The first name", call="find_part", args=(SMALL, "anvil-small"), expect=(0, 3)),
    function("The last name", call="find_part", args=(SMALL, "winch-handle"), expect=(10, 4),
             hint="When low and high are the same place, there's still one name left to look at."),
    custom("Every name in the small list", every_part,
           hint="Look in the middle, (low + high) // 2, and count one look each time round the loop."),
    function("An empty list", call="find_part", args=([], "hubcap"), expect=(-1, 0),
             hint="An empty list has nowhere to look: -1, and 0 looks."),
    function("One name, the right one", call="find_part", args=(["hubcap"], "hubcap"), expect=(0, 1)),
    custom("Every name in the parts list", the_whole_book),
    custom("A million names, found in a handful", million_found,
           hint="Each look should throw away half of what's left. If it's looking at thousands of names, it's searching one at a time."),
    custom("A million names, and it isn't there", million_missing),
    structure("find_part is written by hand", check=find_part_by_hand),
    function("Every bolt", call="starting_with", args=(SMALL, "bolt-"), expect=["bolt-M10", "bolt-M12", "bolt-M8"]),
    function("A whole name is a beginning too", call="starting_with", args=(SMALL, "hubcap"), expect=["hubcap"]),
    function("Nothing starts that way", call="starting_with", args=(SMALL, "piston"), expect=[],
             hint="bisect_left says where piston would go. Whatever is there doesn't start with piston, so there are none."),
    function("Beyond the end", call="starting_with", args=(SMALL, "zinc"), expect=[],
             hint="bisect_left can give len(parts), one past the end. Check the position before you look there."),
    function("An empty list, by beginning", call="starting_with", args=([], "bolt"), expect=[]),
    custom("A million names, by beginning", million_prefix,
           hint="Walking the whole list looks at a million names. bisect_left(parts, prefix) jumps to where they start."),
    custom("Words anywhere means looking everywhere", containing_all,
           hint="Look at every name once, count each look, and keep the ones with the word in."),
    function("No name has the word", call="containing", args=(SMALL, "piston"), expect=([], 11)),
    function("An empty list, by word", call="containing", args=([], "brass"), expect=([], 0)),
    custom("Adding in the middle", adds(["bolt-M8", "hubcap"], "gear-12t", 1, ["bolt-M8", "gear-12t", "hubcap"])),
    custom("Adding one that's already there", adds(["bolt-M8", "hubcap"], "hubcap", 1, ["bolt-M8", "hubcap"]),
           hint="The parts list names each kind of part once. If it's there, leave the list alone and say where it is."),
    custom("Adding to an empty list", adds([], "hubcap", 0, ["hubcap"])),
    custom("Adding the first", adds(["bolt-M8", "hubcap"], "anvil-small", 0, ["anvil-small", "bolt-M8", "hubcap"])),
    custom("Adding the last", adds(["bolt-M8", "hubcap"], "winch-handle", 2, ["bolt-M8", "hubcap", "winch-handle"])),
    custom("Searching for a name", search_line("hubcap", "hubcap: part 8, found in 2 looks")),
    custom("Searching by beginning", search_line("gear-*", "gear-*: 2 parts: gear-12t, gear-24t")),
    custom("One part", search_line("hub*", "hub*: 1 part: hubcap"),
           hint="One part is 1 part, not 1 parts."),
    custom("No parts by beginning", search_line("zinc*", "zinc*: no parts")),
    custom("A word, not a name", search_line(
        "brass", "brass: no part by that name. 2 parts with it in the name (11 looks): hinge-brass, valve-brass"),
        hint="When find_part gives -1, search every name for the word with containing."),
    custom("One part with the word", search_line(
        "ship", "ship: no part by that name. 1 part with it in the name (11 looks): bell-ship")),
    custom("Nothing at all", search_line(
        "piston", "piston: no part by that name, and none with it in the name (11 looks)")),
    custom("Adding with +", search_line("+gear-16t", "gear-16t: added as part 6")),
    custom("Adding one that's there with +", search_line("+hubcap", "hubcap: already part 8")),
    custom("Added, then found", add_then_find,
           hint="add_part changes the list it's given, so the next search sees the new part."),
    output("A search session", inputs=["valve-brass", "bolt-M1*", "piston", ""], expect=SESSION,
           hint="The loop stops at a blank line. Each query prints the line search gives back."),
]
