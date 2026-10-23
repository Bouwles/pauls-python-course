class TooManyComparisons(Exception):
    pass


class Part:
    """A part that counts every time it is compared with ==."""

    comparisons = 0
    limit = None

    def __init__(self, name):
        self.name = name

    def __eq__(self, other):
        Part.comparisons += 1
        if Part.limit is not None and Part.comparisons > Part.limit:
            raise TooManyComparisons()
        return isinstance(other, Part) and self.name == other.name

    def __hash__(self):
        return hash(self.name)

    def __lt__(self, other):
        return self.name < other.name

    def __repr__(self):
        return self.name


def pairs_counts_honestly(ctx):
    module = ctx.module()
    parts = [Part(f"part-{number}") for number in range(50)]
    Part.comparisons = 0
    found, comparisons = module.spares_by_pairs(parts)
    if Part.comparisons != 1225:
        raise CheckFailed("With 50 different parts, comparing each one with every part after it is 1,225 comparisons.",
                          expected=1225, actual=Part.comparisons)
    if comparisons != Part.comparisons:
        raise CheckFailed("The count spares_by_pairs gives back should be the number of comparisons it really made.",
                          expected=Part.comparisons, actual=comparisons)
    if list(found) != []:
        raise CheckFailed("Fifty different parts have no spares.", expected=[], actual=found)


def pairs_large(ctx):
    module = ctx.module()
    parts = [f"part-{number}" for number in range(1000)]
    result = module.spares_by_pairs(parts)
    if result != ([], 499500):
        raise CheckFailed("A thousand different parts: no spares, and 1000 * 999 / 2 comparisons.",
                          expected=([], 499500), actual=result)


def set_not_list(ctx):
    module = ctx.module()
    parts = [Part(f"part-{number}") for number in range(3000)] + [Part("part-7")]
    Part.comparisons = 0
    Part.limit = 20_000
    try:
        found, lookups = module.spares_by_set(parts)
    except TooManyComparisons:
        raise CheckFailed("With 3,001 parts, spares_by_set compared two parts more than 20,000 times. Is something walking along a list for every part?")
    finally:
        Part.limit = None
    names = [part.name for part in found]
    if names != ["part-7"] or lookups != 3001:
        raise CheckFailed("3,001 parts with one spare, part-7: one lookup for each part.",
                          expected=(["part-7"], 3001), actual=(names, lookups))


def set_large(ctx):
    module = ctx.module()
    parts = [f"part-{number % 50_000}" for number in range(100_000)]
    found, lookups = module.spares_by_set(parts)
    if len(found) != 50_000 or lookups != 100_000:
        raise CheckFailed("100,000 parts, two of each of 50,000 kinds: 50,000 spares and 100,000 lookups.",
                          expected=(50_000, 100_000), actual=(len(found), lookups))


def ratio_pairs(ctx):
    module = ctx.module()
    got = module.growth_ratio(module.spares_by_pairs, 100)
    if got != 4.0:
        raise CheckFailed("growth_ratio(spares_by_pairs, 100) compares 19,900 steps with 4,950.", expected=4.0, actual=got)


def ratio_rounded(ctx):
    module = ctx.module()
    got = module.growth_ratio(module.spares_by_pairs, 10)
    if got != 4.2:
        raise CheckFailed("growth_ratio(spares_by_pairs, 10) is 190 / 45, rounded to one decimal place.", expected=4.2, actual=got)


def ratio_set(ctx):
    module = ctx.module()
    got = module.growth_ratio(module.spares_by_set, 50)
    if got != 2.0:
        raise CheckFailed("growth_ratio(spares_by_set, 50) compares 100 lookups with 50.", expected=2.0, actual=got)


def ratio_any_function(ctx):
    module = ctx.module()
    sizes = []

    def cubic(parts):
        sizes.append((len(parts), len(set(parts))))
        return [], len(parts) ** 3

    got = module.growth_ratio(cubic, 7)
    if sorted(sizes) != [(7, 7), (14, 14)]:
        raise CheckFailed("growth_ratio should call the function it's given twice: once with n different parts, once with 2 * n.",
                          expected=[(7, 7), (14, 14)], actual=sorted(sizes))
    if got != 8.0:
        raise CheckFailed("A function whose steps are n cubed takes 8 times the steps when n doubles.", expected=8.0, actual=got)


def unknown_growth(ctx):
    module = ctx.module()
    try:
        result = module.estimate(1.0, 10, 20, "O(n^3)")
    except ValueError:
        return
    raise CheckFailed("estimate should raise ValueError for a growth it doesn't know.", expected="ValueError", actual=repr(result))


TESTS = [
    function("A small yard, by pairs", call="spares_by_pairs", args=(["bolt-M8", "hinge-brass", "bolt-M8", "spring-coil"],),
             expect=(["bolt-M8"], 6), visible=True),
    function("The pier, estimated", call="estimate", args=(0.004, 200, 10_000, "O(n^2)"), expect=10.0, tol=1e-6, visible=True),
    function("No parts, by pairs", call="spares_by_pairs", args=([],), expect=([], 0),
             hint="With no parts there is nothing to compare: no spares, and 0 comparisons."),
    function("One part, by pairs", call="spares_by_pairs", args=(["anvil-small"],), expect=([], 0),
             hint="One part has nothing after it to be compared with."),
    function("Three of a kind, by pairs", call="spares_by_pairs", args=(["gear-12t", "gear-12t", "gear-12t"],),
             expect=(["gear-12t"], 3),
             hint="Each spare is named once in the list, however many copies there are."),
    function("Spares in alphabetical order", call="spares_by_pairs",
             args=(["valve-brass", "bolt-M6", "valve-brass", "anvil-small", "bolt-M6", "valve-brass"],),
             expect=(["bolt-M6", "valve-brass"], 15),
             hint="sorted() puts the spares in alphabetical order, and a set names each one once."),
    custom("It counts the comparisons it really makes", pairs_counts_honestly,
           hint="Add one to the count each time two parts are compared, inside the inner loop."),
    custom("A thousand parts, by pairs", pairs_large),
    function("A small yard, by set", call="spares_by_set", args=(["bolt-M8", "hinge-brass", "bolt-M8", "spring-coil"],),
             expect=(["bolt-M8"], 4)),
    function("No parts, by set", call="spares_by_set", args=([],), expect=([], 0)),
    function("Three of a kind, by set", call="spares_by_set", args=(["gear-12t", "gear-12t", "gear-12t"],),
             expect=(["gear-12t"], 3),
             hint="Three parts, three lookups, and the spare named once."),
    function("Spares in alphabetical order, by set", call="spares_by_set",
             args=(["valve-brass", "bolt-M6", "valve-brass", "anvil-small", "bolt-M6", "valve-brass"],),
             expect=(["bolt-M6", "valve-brass"], 6)),
    custom("By set means a set", set_not_list,
           hint="If `seen` is a list, `part in seen` walks along it for every part. Make it a set."),
    custom("A hundred thousand parts, by set", set_large, timeout=5,
           hint="With a set, a hundred thousand parts take a blink. If this runs out of time, something walks along a list for every part."),
    custom("Doubling, by pairs", ratio_pairs),
    custom("Doubling, rounded", ratio_rounded,
           hint="round(ratio, 1) rounds to one decimal place."),
    custom("Doubling, by set", ratio_set),
    custom("Doubling any function", ratio_any_function,
           hint="growth_ratio uses whichever function it's given, on n different parts like part-0, part-1 and so on, then on 2 * n."),
    function("O(1) stays the same", call="estimate", args=(2.5, 100, 5000, "O(1)"), expect=2.5, tol=1e-6),
    function("O(n) scales with n", call="estimate", args=(0.5, 200, 10_000, "O(n)"), expect=25.0, tol=1e-6),
    function("O(log n)", call="estimate", args=(1.0, 1024, 1_048_576, "O(log n)"), expect=2.0, tol=1e-6,
             hint="For O(log n), scale by log(n_later) / log(n_now). math.log works with any base here."),
    function("O(n log n)", call="estimate", args=(1.0, 1024, 2048, "O(n log n)"), expect=2.2, tol=1e-6,
             hint="For O(n log n), scale by (n_later * log(n_later)) / (n_now * log(n_now))."),
    function("Same size, same time", call="estimate", args=(3.0, 500, 500, "O(n^2)"), expect=3.0, tol=1e-6),
    custom("An unknown growth raises ValueError", unknown_growth,
           hint="If growth isn't one of the five, raise ValueError, with a message saying which growth it didn't know."),
]
