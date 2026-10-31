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


def busy(seconds):
    import time

    start = time.perf_counter()
    while time.perf_counter() - start < seconds:
        pass


def times_the_call(ctx):
    module = ctx.module()
    calls = []

    def slow_job(data):
        calls.append(data)
        busy(0.05)
        return "done"

    pile = ["bolt-M8", "hinge-brass"]
    seconds = module.time_once(slow_job, pile)
    if calls != [pile]:
        raise CheckFailed("time_once should call the function once, with the data it was given.",
                          expected=f"one call with {pile}", actual=f"{len(calls)} calls")
    if isinstance(seconds, bool) or not isinstance(seconds, float):
        raise CheckFailed("time_once should give back the seconds, as a float.", actual=repr(seconds))
    if not 0.05 <= seconds < 2:
        raise CheckFailed("A job that takes a twentieth of a second should time at 0.05 seconds or a little more.",
                          expected="about 0.05", actual=seconds)


def quick_job_is_quick(ctx):
    module = ctx.module()
    seconds = module.time_once(len, ["anvil-small"])
    if isinstance(seconds, bool) or not isinstance(seconds, float) or not 0 <= seconds < 0.05:
        raise CheckFailed("Timing len() on one part should give a tiny number of seconds, not the function's answer.",
                          expected="a float near 0", actual=repr(seconds))


def unknown_growth(ctx):
    module = ctx.module()
    try:
        result = module.scale(10, 20, "O(n^3)")
    except ValueError:
        return
    raise CheckFailed("scale should raise ValueError for a growth it doesn't know.", expected="ValueError", actual=repr(result))


STORE_CHART = (
    "   200 | ##                                       19900\n"
    "   400 | ##########                               79800\n"
    "   800 | ######################################## 319600"
)

SET_CHART = (
    "    10 | ##########                               10\n"
    "    20 | ####################                     20\n"
    "    40 | ######################################## 40"
)

ROUNDED_CHART = (
    "     1 | ######                                   3\n"
    "     2 | ##############                           7\n"
    "     3 | ######################################## 20"
)

ZERO_CHART = (
    "   100 |                                          0\n"
    "   200 |                                          0"
)


def chart_returns_text(ctx):
    module = ctx.module()
    result = module.chart([10, 20, 40], [10, 20, 40])
    if not isinstance(result, str):
        raise CheckFailed("chart should give back the chart as one string, lines joined with \\n, not print it.",
                          actual=repr(result))
    if result != SET_CHART:
        raise CheckFailed("Ten, twenty and forty: bars of 10, 20 and 40.", expected=SET_CHART, actual=result)


TESTS = [
    function("A short list, by pairs", call="spares_by_pairs", args=(["bolt-M8", "hinge-brass", "bolt-M8", "spring-coil"],),
             expect=(["bolt-M8"], 6), visible=True),
    function("The store room's chart", call="chart", args=([200, 400, 800], [19900, 79800, 319600]), expect=STORE_CHART, visible=True),
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
    function("A short list, by set", call="spares_by_set", args=(["bolt-M8", "hinge-brass", "bolt-M8", "spring-coil"],),
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
    custom("Timing a slow job", times_the_call,
           hint="Read time.perf_counter() before the call and again after, and give back the difference."),
    custom("Timing a quick job", quick_job_is_quick,
           hint="time_once gives back the seconds, not whatever the function gave back."),
    function("O(1) stays the same", call="scale", args=(100, 5000, "O(1)"), expect=1, tol=1e-6),
    function("O(n) scales with n", call="scale", args=(200, 10_000, "O(n)"), expect=50.0, tol=1e-6),
    function("O(n^2), the clockmaker's lot", call="scale", args=(200, 10_200, "O(n^2)"), expect=2601.0, tol=1e-6,
             hint="For O(n^2), fifty-one times the parts is fifty-one squared times the work."),
    function("O(log n)", call="scale", args=(1024, 1_048_576, "O(log n)"), expect=2.0, tol=1e-6,
             hint="For O(log n), scale by log(n_later) / log(n_now). math.log works with any base here."),
    function("O(n log n)", call="scale", args=(1024, 2048, "O(n log n)"), expect=2.2, tol=1e-6,
             hint="For O(n log n), scale by (n_later * log(n_later)) / (n_now * log(n_now))."),
    function("Same size, same work", call="scale", args=(500, 500, "O(n^2)"), expect=1.0, tol=1e-6),
    custom("An unknown growth raises ValueError", unknown_growth,
           hint="If growth isn't one of the five, raise ValueError, with a message saying which growth it didn't know."),
    function("Guessing O(n^2)", call="guess_growth", args=(400, 79800, 319600), expect="O(n^2)"),
    function("Guessing O(n)", call="guess_growth", args=(1000, 1000, 2000), expect="O(n)"),
    function("Guessing O(n log n)", call="guess_growth", args=(1000, 9966, 21932), expect="O(n log n)",
             hint="O(n) and O(n log n) are close: from 1000 to 2000 one scales by 2.0 and the other by 2.2. Compare the measured ratio with scale(n, 2 * n, growth) for each, and keep the closest."),
    function("Guessing O(log n)", call="guess_growth", args=(1024, 10, 11), expect="O(log n)"),
    function("Guessing O(1)", call="guess_growth", args=(500, 7, 7), expect="O(1)"),
    function("Guessing from wobbly seconds", call="guess_growth", args=(200, 0.0011, 0.0043), expect="O(n^2)",
             hint="Timings are never exact. 3.9 is nearer 4 than anything else, so it's O(n^2)."),
    custom("A chart is text", chart_returns_text),
    function("Bars rounded to the nearest #", call="chart", args=([1, 2, 3], [3, 7, 20]), expect=ROUNDED_CHART,
             hint="3 out of 20 is 6 of the 40 #s, and 7 out of 20 is 14: round(value / biggest * 40)."),
    function("Nothing but zeros", call="chart", args=([100, 200], [0, 0]), expect=ZERO_CHART,
             hint="With every value 0 there is no biggest to divide by. Every bar is empty."),
]
