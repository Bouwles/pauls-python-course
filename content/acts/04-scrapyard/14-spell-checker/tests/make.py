import random as _random

class TooManyCalls(Exception):
    pass


def counting(module, name, limit):
    """Count every call to the learner's function, including the calls it makes to itself."""
    original = getattr(module, name)
    box = {"calls": 0}

    def wrapper(*args, **kwargs):
        box["calls"] += 1
        if box["calls"] > limit:
            raise TooManyCalls()
        return original(*args, **kwargs)

    setattr(module, name, wrapper)
    return wrapper, box


def true_distance(given, correct):
    previous = list(range(len(correct) + 1))
    for row, letter in enumerate(given, start=1):
        current = [row]
        for col, other in enumerate(correct, start=1):
            current.append(previous[col - 1] if letter == other else 1 + min(previous[col], current[col - 1], previous[col - 1]))
        previous = current
    return previous[-1]


def long_words(ctx):
    module = ctx.module()
    rng = _random.Random(7)
    given = "".join(rng.choice("ACGT") for _ in range(60))
    correct = "".join(rng.choice("ACGT") for _ in range(55))
    edit_distance, box = counting(module, "edit_distance", 50_000)
    try:
        got = edit_distance(given, correct)
    except TooManyCalls:
        raise CheckFailed("Comparing two words of about sixty letters took more than 50,000 calls to edit_distance. Work each pair of beginnings out once: a table does it.")
    expected = true_distance(given, correct)
    if got != expected:
        raise CheckFailed("Two long strings of letters.", expected=expected, actual=got)


def both_ways(ctx):
    module = ctx.module()
    for one, other in [("kito", "quito"), ("berlin", "berli"), ("lamp", "plum"), ("", "quiz")]:
        there, back = module.edit_distance(one, other), module.edit_distance(other, one)
        if there != back or there != true_distance(one, other):
            raise CheckFailed(f"Turning {one!r} into {other!r} takes as many changes as turning it back.",
                              expected=(true_distance(one, other), true_distance(one, other)), actual=(there, back))


def word_list(ctx):
    counts = {}
    for line in ctx.files["words.csv"].splitlines()[1:]:
        word, count = line.split(",")
        counts[word] = int(count)
    return counts


SMALL = {"captain": 213, "cabin": 40, "cap'n": 12, "caption": 1, "cat": 30, "coat": 5, "cot": 5, "act": 9}


def suggests(word, expected, counts=None, limit=None):
    def check(ctx):
        module = ctx.module()
        words = SMALL if counts is None else counts
        got = module.suggest(word, dict(words)) if limit is None else module.suggest(word, dict(words), limit)
        if got != expected:
            raise CheckFailed(f"suggest({word!r}, ...) gives the wrong words, or the right ones in the wrong order.",
                              expected=expected, actual=got)
    return check


def on_the_book(ctx):
    got = ctx.module().suggest("captin", word_list(ctx))
    if got != ["captain", "cap'n", "cabin"]:
        raise CheckFailed("On the word list, captin is one change from captain, and two from cap'n and cabin, the commoner first.",
                          expected=["captain", "cap'n", "cabin"], actual=got)


def checks(text, expected):
    def check(ctx):
        got = ctx.module().check(text, dict(SMALL))
        if got != expected:
            raise CheckFailed(f"check({text!r}, ...) gives the wrong unknown words or suggestions.", expected=expected, actual=got)
    return check


SESSION = """Knows 7709 words.
'Copenhagan' for 'Copenhagen': near enough
'Kito' for 'Quito': wrong
'Copenahgen' for 'Copenhagen': near enough
  captin: captain, cap'n, cabin
  iland: island, land, and
  nite: nine, note, bite
Every word known."""

TESTS = [
    function("Copenhagan", call="edit_distance", args=("Copenhagan", "Copenhagen"), expect=1, visible=True),
    output("Paul's answers, and a sentence checked", inputs=["The captin sailed round the iland at nite.", "Fifteen men on the dead man's chest", ""],
           expect=SESSION, visible=True),
    function("Nothing into nothing", call="edit_distance", args=("", ""), expect=0),
    function("Something from nothing", call="edit_distance", args=("", "QUIZ"), expect=4,
             hint="Turning no letters into four letters takes four letters put in. That's the first row of the table."),
    function("Nothing from something", call="edit_distance", args=("QUIZ", ""), expect=4),
    function("Spelt right", call="edit_distance", args=("quito", "quito"), expect=0),
    function("One letter short", call="edit_distance", args=("berlin", "berli"), expect=1),
    function("Kito for Quito", call="edit_distance", args=("kito", "quito"), expect=2),
    function("Lamp for plum", call="edit_distance", args=("lamp", "plum"), expect=3,
             hint="When two letters don't match, try all three: take one out (from above), put one in (from the left), or swap (up and to the left)."),
    custom("There and back", both_ways),
    custom("Sixty letters", long_words),
    custom("Nearest first", suggests("captin", ["captain", "caption", "cabin"]),
           hint="Fewest changes first. captain and caption are one change away; cabin and cap'n are two."),
    custom("Commoner first on a tie", suggests("cta", ["cat", "act", "coat"]),
           hint="When two words are the same number of changes away, the one that turned up more often in the books comes first."),
    custom("A to Z when the counts tie too", suggests("cxt", ["cat", "cot", "act"], counts={"cot": 5, "cat": 5, "act": 5, "coat": 5}),
           hint="Fewest changes, then the biggest count, then alphabetical: sorting tuples like (changes, -count, word) does all three."),
    custom("A shorter list", suggests("captin", ["captain"], limit=1)),
    custom("Nothing near", suggests("zzzzzz", []),
           hint="Only words within two changes are suggested. If there are none, give back an empty list."),
    custom("On the word list", on_the_book),
    custom("Words it doesn't know", checks("The Captin's cat sat", [("the", []), ("captin's", []), ("sat", ["cat", "act", "coat"])]),
           hint="Every word, in lower case and in order, that isn't in the counts, with its suggestions."),
    custom("Each unknown word once", checks("cta cta cat", [("cta", ["cat", "act", "coat"])]),
           hint="A word that's already been reported isn't reported again."),
    custom("Every word known", checks("Cat, coat. COT", [])),
    function("Right, in any case", call="mark", args=("  COPENHAGEN ", "Copenhagen"), expect="right"),
    function("Riya's answer", call="mark", args=("Copenhagan", "Copenhagen"), expect="near enough"),
    function("Two slips in ten letters", call="mark", args=("Copenahgen", "Copenhagen"), expect="near enough",
             hint="Ten letters allow two changes. Swapping two letters round takes two."),
    function("Four slips in ten letters", call="mark", args=("Kobenhavn", "copenhagen"), expect="wrong"),
    function("Yahya's answer", call="mark", args=("Kito", "Quito"), expect="wrong"),
    function("No slips in a short answer", call="mark", args=("cod", "Cog"), expect="wrong",
             hint="Paul allows one change for every five letters of the right answer. Three letters allow none."),
]
