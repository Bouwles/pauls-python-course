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


def no_hidden_loop(ctx):
    module = ctx.module()
    parts = [Part(f"part-{number}") for number in range(3000)] + [Part("part-42")]
    Part.comparisons = 0
    Part.limit = 20_000
    try:
        found = module.spares(parts)
    except TooManyComparisons:
        raise CheckFailed("With 3,001 parts, spares compared two parts more than 20,000 times. Something in there walks along a list for every part.")
    finally:
        Part.limit = None
    names = [part.name for part in found]
    if names != ["part-42"]:
        raise CheckFailed("The only spare among those parts is part-42.", expected=["part-42"], actual=names)


TESTS = [
    function("Nell's spares", call="spares", args=(["hubcap", "spring", "hubcap", "gear", "spring", "hubcap"],),
             expect=["hubcap", "spring"], visible=True),
    custom("Thousands of parts, no hidden loop", no_hidden_loop, visible=True,
           hint="`part in seen` walks the whole list when seen is a list. A set goes straight to where the part would be."),
    function("No spares", call="spares", args=(["bolt-M8", "nut-M8", "washer-10"],), expect=[]),
    function("Nothing at all", call="spares", args=([],), expect=[],
             hint="With no parts, there are no spares: an empty list."),
    function("Three of one kind", call="spares", args=(["gear-12t", "gear-12t", "gear-12t"],), expect=["gear-12t"],
             hint="Each spare is named once, however many copies Nell has."),
]
