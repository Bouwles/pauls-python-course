import random as _random


def big_pile(ctx):
    module = ctx.module()
    pile_maker = _random.Random(11)
    pile = [pile_maker.randint(1, 20) for _ in range(300)]
    got = module.quick_sort(list(pile))
    if got != sorted(pile):
        raise CheckFailed("300 weights between 1 and 20, so plenty of repeats. Every one should come out, in order.",
                          expected=f"{len(pile)} weights in order", actual=f"{len(got)} weights")


def leaves_pile_alone(ctx):
    module = ctx.module()
    pile = [7, 3, 9, 7, 1]
    module.quick_sort(pile)
    if pile != [7, 3, 9, 7, 1]:
        raise CheckFailed("quick_sort hands back a new list; the pile it was given should stay as it was.",
                          expected=[7, 3, 9, 7, 1], actual=pile)


TESTS = [
    function("Nell's engines", call="quick_sort", args=([7, 3, 9, 7, 1, 7, 4],), expect=[1, 3, 4, 7, 7, 7, 9], visible=True,
             hint="Count the 7s going in and coming out. Where does a part go if it weighs the same as the pivot?"),
    function("All the same weight", call="quick_sort", args=([5, 5, 5],), expect=[5, 5, 5], visible=True),
    function("No repeats", call="quick_sort", args=([9, 4, 6, 1],), expect=[1, 4, 6, 9]),
    function("An empty pile", call="quick_sort", args=([],), expect=[]),
    function("Two, back to front", call="quick_sort", args=([2, 1],), expect=[1, 2]),
    custom("Three hundred weights, with repeats", big_pile),
    custom("The pile it's given stays as it was", leaves_pile_alone),
]
