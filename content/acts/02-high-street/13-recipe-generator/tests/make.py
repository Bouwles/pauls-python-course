import types as _types

LOAF_ONE = "flour: 500 g\nwater: 350 ml\nyeast: 7 g\nsalt: 10 g\nbutter: 25 g"
LOAF_THREE = "flour: 1500 g\nwater: 1050 ml\nyeast: 21 g\nsalt: 30 g\nbutter: 75 g"
LOAF_ELEVEN = "flour: 5500 g\nwater: 3850 ml\nyeast: 77 g\nsalt: 110 g\nbutter: 275 g"
LOAF_NONE = "flour: 0 g\nwater: 0 ml\nyeast: 0 g\nsalt: 0 g\nbutter: 0 g"

BUNS = """# Bea's iced buns. Makes twelve.
milk,150,ml

flour,450,g
sugar,60,g
# Icing goes on cold.
   icing sugar,200,g
"""


class _Endless:
    """Ingredients that never run out. Complains if read too far ahead."""

    def __init__(self):
        self.pulled = 0

    def __iter__(self):
        return self

    def __next__(self):
        self.pulled += 1
        if self.pulled > 50:
            raise CheckFailed("scale tried to read every ingredient before handing any over. Yield each one as soon as it's worked out.")
        return ("flour", self.pulled, "g")


def scale_a_list(ctx):
    mod = ctx.module()
    got = list(mod.scale([("flour", 500, "g"), ("eggs", 2, "whole")], 4))
    want = [("flour", 2000, "g"), ("eggs", 8, "whole")]
    if got != want:
        raise CheckFailed("list(scale(...)) should give each ingredient with its amount multiplied, name and unit unchanged.", expected=repr(want), actual=repr(got))


def read_buns(ctx):
    mod = ctx.module(files={"buns.txt": BUNS})
    got = list(mod.read_recipe("buns.txt"))
    want = [("milk", 150, "ml"), ("flour", 450, "g"), ("sugar", 60, "g"), ("icing sugar", 200, "g")]
    if got != want:
        raise CheckFailed("read_recipe should yield a tuple for each ingredient line, skipping blank lines and notes.", expected=repr(want), actual=repr(got))


def only_notes(ctx):
    mod = ctx.module(files={"notes.txt": "# Nothing to bake today.\n\n# Bea is at her sister's.\n"})
    got = list(mod.read_recipe("notes.txt"))
    if got != []:
        raise CheckFailed("A recipe with nothing but notes has no ingredients.", expected="[]", actual=repr(got))


def amounts_are_numbers(ctx):
    mod = ctx.module()
    first = next(iter(mod.read_recipe("recipe.txt")))
    if not isinstance(first[1], int):
        raise CheckFailed(f"The amount should be a whole number, not {type(first[1]).__name__}.", expected="('flour', 500, 'g')", actual=repr(first))


def read_is_generator(ctx):
    mod = ctx.module()
    made = mod.read_recipe("recipe.txt")
    if not isinstance(made, _types.GeneratorType):
        raise CheckFailed(f"Calling read_recipe should hand back a generator, not a {type(made).__name__}.")


def scale_is_lazy(ctx):
    mod = ctx.module()
    scaled = mod.scale(_Endless(), 2)
    got = [next(scaled) for _ in range(3)]
    want = [("flour", 2, "g"), ("flour", 4, "g"), ("flour", 6, "g")]
    if got != want:
        raise CheckFailed("The first three from an endless list, doubled.", expected=repr(want), actual=repr(got))


TESTS = [
    output("Three batches of Bea's loaf", inputs=["3"], expect=LOAF_THREE, visible=True),
    custom("scale on four lots of flour and eggs", scale_a_list, visible=True),
    output("One batch", inputs=["1"], expect=LOAF_ONE,
           hint="One batch is the recipe as written. If this fails, check the notes and the blank line are skipped."),
    output("Eleven batches", inputs=["11"], expect=LOAF_ELEVEN,
           hint="If small numbers work and this doesn't, look for a number typed into the code."),
    custom("read_recipe on Bea's iced buns", read_buns,
           hint="Notes and blank lines can be anywhere, and a line can start with spaces. Strip each line before you check it."),
    custom("Amounts are whole numbers", amounts_are_numbers,
           hint="split gives text. Turn the amount into a number with int() before you hand it over."),
    output("No batches at all", inputs=["0"], expect=LOAF_NONE,
           hint="Zero batches is still five lines, every amount 0."),
    custom("A recipe that is all notes", only_notes,
           hint="If every line is a note, read_recipe should hand over nothing, and nothing should crash."),
    custom("read_recipe is a generator", read_is_generator,
           hint="read_recipe should yield each tuple. With yield in it, calling it hands back a generator."),
    custom("scale hands each one over as soon as it's ready", scale_is_lazy, timeout=5,
           hint="scale must not collect everything first. Put yield inside the loop instead of building a list to return."),
]
