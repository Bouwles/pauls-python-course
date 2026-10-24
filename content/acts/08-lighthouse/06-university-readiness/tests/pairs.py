import random as _random


def big_check(prices, target, expected, message):
    def check(ctx):
        module = ctx.module()
        got = module.count_pairs(prices(), target)
        if got != expected:
            raise CheckFailed(message, expected=expected, actual=got)
    return check


def thirties_and_seventies():
    shuffle = _random.Random(3)
    prices = [30] * 100_000 + [70] * 100_000
    shuffle.shuffle(prices)
    return prices


def all_fifties():
    return [50] * 200_000


def nothing_adds_up():
    shuffle = _random.Random(9)
    return [shuffle.randint(1, 49) for _ in range(200_000)]


def the_whole_market():
    # 200,000 prices: 1p to 199p, then 60 at exactly 100p.
    return [1 + index % 199 for index in range(200_000)] + [100] * 60


TESTS = [
    function("Two pairs make a pound", call="count_pairs", args=([30, 70, 50, 50, 20], 100), expect=2, visible=True),
    function("Three ways to pick two", call="count_pairs", args=([50, 50, 50], 100), expect=3, visible=True),
    function("An empty stall", call="count_pairs", args=([], 100), expect=0),
    function("One item can't pair with itself", call="count_pairs", args=([50], 100), expect=0,
             hint="A 50p item and the same 50p item aren't a pair. Count only items you've already gone past."),
    function("Nothing adds up", call="count_pairs", args=([10, 20, 30], 100), expect=0),
    function("Order doesn't matter", call="count_pairs", args=([70, 30], 100), expect=1),
    function("Doubles on both sides", call="count_pairs", args=([30, 30, 70, 70], 100), expect=4,
             hint="Each 30 pairs with each 70: two times two. Count how many of each price you've seen, not just whether you've seen it."),
    function("A different target", call="count_pairs", args=([25, 75, 75, 125, 0, 150], 150), expect=3),
    function("Free items", call="count_pairs", args=([0, 0, 0, 0], 0), expect=6),
    custom("100,000 at 30p and 100,000 at 70p", big_check(thirties_and_seventies, 100, 10_000_000_000,
           "Every 30p item pairs with every 70p item: 100,000 times 100,000."), timeout=5,
           hint="Comparing every pair is 20 billion comparisons. Go through once, and ask how many earlier items cost exactly what this one needs."),
    custom("200,000 at 50p", big_check(all_fifties, 100, 19_999_900_000,
           "200,000 items at 50p: 200,000 times 199,999, halved."), timeout=5,
           hint="Keeping a list of matches and walking it is still a loop inside a loop. Keep a count of each price instead."),
    custom("200,000 prices and no pairs", big_check(nothing_adds_up, 100, 0,
           "Every price is under 50p, so no two make 100p."), timeout=5),
    custom("The whole market", big_check(the_whole_market, 100, 50_000_760,
           "200,060 prices from 1p to 199p."), timeout=5),
]
