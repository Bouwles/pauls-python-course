def deep_tower(levels):
    """A tower `levels` crates deep, with a 1 kg part in every crate."""
    crate = [1]
    for _ in range(levels - 1):
        crate = [1, crate]
    return crate


def deep_weigh(ctx):
    module = ctx.module()
    got = module.weigh(deep_tower(200))
    if got != 200:
        raise CheckFailed("A tower 200 crates deep, with a 1 kg part in every crate, weighs 200 kg.", expected=200, actual=got)


def deep_count(ctx):
    module = ctx.module()
    got = module.count_parts(deep_tower(200))
    if got != 200:
        raise CheckFailed("A tower 200 crates deep, with one part in every crate, holds 200 parts.", expected=200, actual=got)


def deep_depth(ctx):
    module = ctx.module()
    got = module.depth(deep_tower(200))
    if got != 200:
        raise CheckFailed("This tower is 200 crates deep.", expected=200, actual=got)


def tower_untouched(ctx):
    module = ctx.module()
    tower = [4, [2, 3], [1, [5, [6]]]]
    module.weigh(tower)
    module.count_parts(tower)
    module.depth(tower)
    if tower != [4, [2, 3], [1, [5, [6]]]]:
        raise CheckFailed("Weighing, counting and measuring a tower shouldn't change it.",
                          expected=[4, [2, 3], [1, [5, [6]]]], actual=tower)


def counted_calls(ctx):
    module = ctx.module()
    original = module.packings
    calls = [0]

    class TooManyCalls(Exception):
        pass

    def counting(*args, **kwargs):
        calls[0] += 1
        if calls[0] > 5000:
            raise TooManyCalls()
        return original(*args, **kwargs)

    module.packings = counting
    try:
        got = module.packings(30)
    except TooManyCalls:
        raise CheckFailed("packings(30) made more than 5,000 calls to packings. Penhallow's makes over four million; "
                          "one that remembers its answers needs about sixty.")
    finally:
        module.packings = original
    if got != 1346269:
        raise CheckFailed("A 30 m lorry has 1,346,269 packings.", expected=1346269, actual=got)
    if calls[0] > 200:
        raise CheckFailed("packings(30) should work each length out once, so it needs about sixty calls.",
                          expected="200 calls or fewer", actual=f"{calls[0]} calls")


TESTS = [
    function("Nell's tower, weighed", call="weigh", args=([4, [2, 3], [1, [5]]],), expect=15, visible=True),
    function("A 12 m lorry", call="packings", args=(12,), expect=233, visible=True),
    function("An empty crate weighs nothing", call="weigh", args=([],), expect=0,
             hint="A crate with nothing in it weighs 0 kg. Start the total at 0 and it does."),
    function("One part", call="weigh", args=([7],), expect=7),
    function("Crates of empty crates", call="weigh", args=([[], [[]], [[], [[]]]],), expect=0,
             hint="Empty crates inside empty crates still weigh nothing, however many there are."),
    function("Half a kilo here and there", call="weigh", args=([2.5, [0.5, [1.0]]],), expect=4.0, tol=1e-9),
    function("A crate inside a crate inside a crate", call="weigh", args=([[[9]], 1],), expect=10),
    custom("Two hundred crates deep, weighed", deep_weigh,
           hint="Each crate's weight is its own parts plus whatever weigh gives back for the crates inside."),
    function("Nell's tower, counted", call="count_parts", args=([4, [2, 3], [1, [5, [6]]]],), expect=6),
    function("Nothing to count", call="count_parts", args=([],), expect=0),
    function("Crates aren't parts", call="count_parts", args=([[], [[]]],), expect=0,
             hint="Only numbers are parts. A crate counts whatever is in it, not itself."),
    function("A part that weighs nothing is still a part", call="count_parts", args=([0, [0]],), expect=2,
             hint="Count 1 for every part, whatever it weighs. A 0 kg washer is still there."),
    custom("Two hundred crates deep, counted", deep_count),
    function("Nell's tower, measured", call="depth", args=([4, [2, 3], [1, [5, [6]]]],), expect=4),
    function("An empty crate is 1 deep", call="depth", args=([],), expect=1,
             hint="A crate with no crates inside is 1 deep, even with nothing in it at all."),
    function("Parts don't add depth", call="depth", args=([4, 2, 9],), expect=1),
    function("The deepest side wins", call="depth", args=([[1], [[[2]]], [3]],), expect=4,
             hint="A crate is one more than its deepest crate inside, not one more than the first or the last."),
    function("Empty crates count for depth", call="depth", args=([[], [[[]]]],), expect=4),
    custom("Two hundred crates deep, measured", deep_depth),
    custom("The tower is left as it was", tower_untouched),
    function("No lorry at all", call="packings", args=(0,), expect=1,
             hint="An empty bed has exactly one packing: no crates. Penhallow's answers are right; keep them."),
    function("A 1 m bed", call="packings", args=(1,), expect=1),
    function("Too short", call="packings", args=(-1,), expect=0,
             hint="A bed shorter than nothing can't be filled: 0 ways. Penhallow's answers are right; keep them."),
    function("A 5 m van", call="packings", args=(5,), expect=8),
    function("The 40 m ferry deck", call="packings", args=(40,), expect=165580141, timeout=5,
             hint="Penhallow's version would take hours here. Remember each answer the first time it's worked out."),
    custom("Counting the calls for a 30 m lorry", counted_calls, timeout=5,
           hint="Every call should check whether its length has been worked out already, before doing any work."),
    function("Two hundred metres of lorries", call="packings", args=(200,),
             expect=453973694165307953197296969697410619233826, timeout=5),
]
