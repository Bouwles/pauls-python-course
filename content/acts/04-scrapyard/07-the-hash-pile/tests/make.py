def _hash(name):
    number = 0
    for character in name:
        number = (number * 31 + ord(character)) % 1_000_003
    return number


def _parts(count):
    kinds = ["bolt", "nut", "washer", "spring", "hinge", "valve", "gear", "chain", "hubcap", "bell"]
    return [f"{kinds[number % len(kinds)]}-{number // len(kinds) + 1}" for number in range(count)]


class _Reference:
    """Paul's hash map, kept on the back bench to check yours against."""

    def __init__(self, piles=8):
        self.piles = [[] for _ in range(piles)]
        self.count = 0
        self.probes = 0

    def _find(self, pile, name):
        for position, (stored, _value) in enumerate(pile):
            self.probes += 1
            if stored == name:
                return position
        return -1

    def put(self, name, value):
        pile = self.piles[_hash(name) % len(self.piles)]
        position = self._find(pile, name)
        if position >= 0:
            pile[position] = (name, value)
            return
        pile.append((name, value))
        self.count += 1
        if self.count > 0.75 * len(self.piles):
            old = self.piles
            self.piles = [[] for _ in range(2 * len(old))]
            for old_pile in old:
                for pair in old_pile:
                    self.piles[_hash(pair[0]) % len(self.piles)].append(pair)


def contents(hash_map):
    try:
        return [[tuple(pair) for pair in pile] for pile in hash_map.piles]
    except (TypeError, AttributeError):
        raise CheckFailed("self.piles should be a list of piles, each a list of (name, value) pairs.")


def same(got, expected, message):
    if got != expected:
        raise CheckFailed(message, expected=expected, actual=got)


def a_few_parts(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("brass-valve", 3)
    table.put("kettle", 1)
    same(table.get("brass-valve"), 3, "get gives back the value stored under the name.")
    same(table.get("anvil"), None, "A name that isn't there gives None.")
    same(table.get("anvil", 0), 0, "A name that isn't there gives the default, when there is one.")
    same(len(table), 2, "Two names stored.")


def a_new_pile(ctx):
    module = ctx.module()
    table = module.HashMap()
    same(contents(table), [[] for _ in range(8)], "A new HashMap has 8 empty piles.")
    same(len(table), 0, "A new HashMap holds no names.")
    same(table.probes, 0, "A new HashMap has made no probes.")
    small = module.HashMap(4)
    same(contents(small), [[], [], [], []], "HashMap(4) starts with 4 empty piles.")


def right_piles(ctx):
    module = ctx.module()
    table = module.HashMap()
    reference = _Reference()
    for number, name in enumerate(["brass-valve", "kettle", "anvil", "bell", "chain"]):
        table.put(name, number)
        reference.put(name, number)
    same(contents(table), contents(reference), "Each pair goes on the end of pile part_hash(name) % 8.")


def replace_value(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("gear-1", 5)
    table.put("gear-1", 9)
    same(table.get("gear-1"), 9, "Putting a name again replaces its value.")
    same(len(table), 1, "Putting a name again doesn't add a second one.")
    same(sum(len(pile) for pile in table.piles), 1, "There should be one pair for gear-1, not two.")


def replace_in_place(ctx):
    module = ctx.module()
    table = module.HashMap()
    for number, name in enumerate(["hinge-1", "chain-1", "hubcap-1"]):
        table.put(name, number)
    table.put("chain-1", 40)
    same(contents(table)[1], [("hinge-1", 0), ("chain-1", 40), ("hubcap-1", 2)],
         "hinge-1, chain-1 and hubcap-1 share pile 1. Replacing chain-1 keeps it where it stands, in the middle.")


def probes_in_a_shared_pile(ctx):
    module = ctx.module()
    table = module.HashMap()
    steps = [
        ("put hinge-1", lambda: table.put("hinge-1", 1), 0),
        ("put chain-1", lambda: table.put("chain-1", 2), 1),
        ("put hubcap-1", lambda: table.put("hubcap-1", 3), 3),
        ("get hubcap-1", lambda: table.get("hubcap-1"), 6),
        ("get hinge-1", lambda: table.get("hinge-1"), 7),
        ("get nut-4, which isn't there", lambda: table.get("nut-4"), 10),
        ("ask whether chain-1 is in", lambda: "chain-1" in table, 12),
        ("remove chain-1", lambda: table.remove("chain-1"), 14),
        ("get hubcap-1 again", lambda: table.get("hubcap-1"), 16),
    ]
    for label, action, expected in steps:
        action()
        if table.probes != expected:
            raise CheckFailed(f"hinge-1, chain-1, hubcap-1 and nut-4 all belong in pile 1. After {label}, probes should be {expected}.",
                              expected=expected, actual=table.probes)


def empty_pile_free(ctx):
    module = ctx.module()
    table = module.HashMap()
    for name in ["hinge-1", "chain-1", "hubcap-1"]:
        table.put(name, 0)
    before = table.probes
    table.get("nut-3")
    "washer-3" in table
    same(table.probes - before, 0, "nut-3 and washer-3 belong in pile 0, which is empty: looking there compares nothing.")


def contains(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("valve-1", 4)
    same("valve-1" in table, True, "valve-1 was put in.")
    same("valve-2" in table, False, "valve-2 never was.")


def remove_returns(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("spring-1", 12)
    table.put("bolt-1", 30)
    same(table.remove("spring-1"), 12, "remove gives back the value it took out.")
    same(len(table), 1, "One name left.")
    same("spring-1" in table, False, "spring-1 is gone.")
    same(table.get("bolt-1"), 30, "bolt-1 is still there.")


def remove_middle(ctx):
    module = ctx.module()
    table = module.HashMap()
    for number, name in enumerate(["hinge-1", "chain-1", "hubcap-1"]):
        table.put(name, number)
    table.remove("chain-1")
    same(contents(table)[1], [("hinge-1", 0), ("hubcap-1", 2)], "Taking chain-1 out of the middle of pile 1 leaves the other two in order.")


def remove_missing(ctx):
    module = ctx.module()
    table = module.HashMap()
    try:
        table.remove("anvil")
    except KeyError:
        pass
    else:
        raise CheckFailed("Removing from an empty HashMap should raise KeyError.")
    table.put("hinge-1", 1)
    try:
        table.remove("chain-1")
    except KeyError:
        same(len(table), 1, "A failed remove takes nothing out.")
        return
    raise CheckFailed("chain-1 shares a pile with hinge-1 but was never put in, so remove should raise KeyError.")


def remove_then_put(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("gear-2", 1)
    table.remove("gear-2")
    table.put("gear-2", 7)
    same(table.get("gear-2"), 7, "A name taken out can be put back.")
    same(len(table), 1, "One name, once.")


def none_value(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("washer-1", None)
    same(table.get("washer-1", "not here"), None, "washer-1 is stored, with None as its value, so get gives back None, not the default.")
    same("washer-1" in table, True, "washer-1 is in, even though its value is None.")


def empty_name(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("", 5)
    same(contents(table)[0], [("", 5)], "part_hash(\"\") is 0, so the empty name goes in pile 0.")
    same(table.get(""), 5, "The empty name is a name like any other.")


def doubles_on_time(ctx):
    module = ctx.module()
    small = module.HashMap(4)
    names = _parts(8)
    for count, name in enumerate(names[:3], start=1):
        small.put(name, count)
    same(len(small.piles), 4, "Three names in four piles is exactly 0.75 to a pile: not more, so no doubling yet.")
    small.put(names[3], 4)
    same(len(small.piles), 8, "The fourth name makes it 1.0 to a pile, more than 0.75, so the piles double to 8.")
    table = module.HashMap()
    for name in names[:6]:
        table.put(name, 0)
    same(len(table.piles), 8, "Six names in eight piles is 0.75 to a pile: no doubling yet.")
    table.put(names[6], 0)
    same(len(table.piles), 16, "The seventh name makes it more than 0.75, so the piles double to 16.")


def replace_never_doubles(ctx):
    module = ctx.module()
    small = module.HashMap(4)
    for name in _parts(3):
        small.put(name, 1)
    small.put(_parts(3)[0], 2)
    same(len(small.piles), 4, "Replacing a value adds no name, so it never doubles the piles.")
    same(len(small), 3, "Still three names.")


def moved_in_order(ctx):
    module = ctx.module()
    table = module.HashMap()
    reference = _Reference()
    for number, name in enumerate(_parts(30)):
        table.put(name, number)
        reference.put(name, number)
    same(len(table.piles), len(reference.piles), "Thirty names: the piles double from 8 to 16 to 32 to 64.")
    same(contents(table), contents(reference),
         "After doubling, every pair is in pile part_hash(name) % the new number of piles, moved over old pile by old pile, front to back.")


def moving_costs_nothing(ctx):
    module = ctx.module()
    table = module.HashMap()
    reference = _Reference()
    for number, name in enumerate(_parts(25)):
        table.put(name, number)
        reference.put(name, number)
    same(table.probes, reference.probes, "Twenty-five puts, with the piles doubling three times on the way. Moving pairs to new piles compares no names, so it adds no probes.")


def load(ctx):
    module = ctx.module()
    table = module.HashMap()
    same(table.load(), 0.0, "No names in eight piles.")
    for name in _parts(6):
        table.put(name, 0)
    same(table.load(), 0.75, "Six names in eight piles is 0.75 to a pile.")


def a_thousand_parts(ctx):
    module = ctx.module()
    table = module.HashMap()
    names = _parts(1000)
    for number, name in enumerate(names):
        table.put(name, number)
    same(len(table), 1000, "A thousand names stored.")
    same(len(table.piles), 2048, "A thousand names: the piles double up to 2048.")
    table.probes = 0
    for number, name in enumerate(names):
        if table.get(name) != number:
            raise CheckFailed(f"{name} should give back {number}.", expected=number, actual=table.get(name))
    if table.probes > 1300:
        raise CheckFailed("Finding a thousand parts should take a probe or so each, about 1,100 in all.",
                          expected="1300 or fewer", actual=table.probes)


def no_dict_inside(ctx):
    module = ctx.module()
    table = module.HashMap()
    table.put("bolt-1", 1)
    for name, value in vars(table).items():
        if isinstance(value, dict):
            raise CheckFailed(f"The HashMap keeps a dict called {name}. Build it from the piles alone.")


TESTS = [
    custom("A few parts", a_few_parts, visible=True),
    output("The main block", visible=True,
           expect="200 parts in 512 piles, 0.39 to a pile\nFinding every part: 235 probes\n"
                  "Finding every part along one long list: 20100 probes"),
    custom("A new hash map", a_new_pile, hint="self.piles = [[] for _ in range(piles)] makes separate empty piles."),
    custom("Each name in its pile", right_piles),
    custom("Replacing a value", replace_value),
    custom("Replacing in a shared pile", replace_in_place,
           hint="When the name is already in its pile, put the new pair at the same position rather than removing and appending."),
    custom("Probes in a shared pile", probes_in_a_shared_pile,
           hint="Add one probe for each stored name you compare, stopping as soon as you find the one you want."),
    custom("Looking in an empty pile", empty_pile_free),
    custom("in", contains, hint="Python calls __contains__(self, name) for name in pile."),
    custom("remove gives back the value", remove_returns),
    custom("Out of the middle of a pile", remove_middle),
    custom("Removing a name that isn't there", remove_missing,
           hint="If the name isn't in its pile, raise KeyError(name)."),
    custom("Removed, then put back", remove_then_put),
    custom("None as a value", none_value,
           hint="Decide whether a name is there by finding it, not by whether its value is None."),
    custom("The empty name", empty_name),
    custom("Doubling at the right moment", doubles_on_time,
           hint="Double after a put that adds a new name, when the count is more than 0.75 times the number of piles."),
    custom("Replacing never doubles", replace_never_doubles),
    custom("Every pair moved, in order", moved_in_order,
           hint="Make the new piles, then go through the old piles in order, appending each pair to the end of its new pile."),
    custom("Moving costs no probes", moving_costs_nothing,
           hint="When the piles double, append each pair straight to its new pile; don't put() it, which would compare names."),
    custom("load()", load),
    custom("A thousand parts", a_thousand_parts, timeout=5),
    custom("Built from piles", no_dict_inside),
]
