import ast as _ast


def records(ctx):
    m = ctx.module()
    for name in ("Stamp", "Postcard", "total_postage", "redirect"):
        if not hasattr(m, name):
            raise CheckFailed(f"There is no {name} in postcards.py.")
    return m


def same(what, got, want):
    if got != want or type(got) is not type(want):
        raise CheckFailed(what, expected=want, actual=got)


def beas_card(ctx):
    m = records(ctx)
    card = m.Postcard("Bea", "Truro", m.Stamp.FIRST, "Wish you were here")
    same("How Bea's postcard shows itself", repr(card),
         "Postcard(sender='Bea', to='Truro', stamp=<Stamp.FIRST: 135>, message='Wish you were here')")
    same("Postage for a first-class card", card.postage(), 135)


def todays_bag(ctx):
    m = records(ctx)
    cards = [
        m.Postcard("Bea", "Truro", m.Stamp.FIRST, "Wish you were here"),
        m.Postcard("Tom", "Lisbon", m.Stamp.ABROAD),
        m.Postcard("Gwen", "Bodmin", m.Stamp.SECOND),
    ]
    same("Postage for first, abroad and second", m.total_postage(cards), 440)


def three_stamps(ctx):
    m = records(ctx)
    import enum
    if not (isinstance(m.Stamp, type) and issubclass(m.Stamp, enum.Enum)):
        raise CheckFailed("Stamp should be an Enum: class Stamp(Enum).")
    got = {member.name: member.value for member in m.Stamp}
    same("Stamp's members and their values", got, {"FIRST": 135, "SECOND": 85, "ABROAD": 220})


def frozen(ctx):
    m = records(ctx)
    import dataclasses
    card = m.Postcard("Bea", "Truro", m.Stamp.FIRST)
    try:
        card.to = "Tresco"
    except dataclasses.FrozenInstanceError:
        pass
    else:
        raise CheckFailed("A posted card was changed from Truro to Tresco. Nothing should be able to do that.")
    same("The card still goes to", card.to, "Truro")


def default_message(ctx):
    m = records(ctx)
    same("A card posted without a message", m.Postcard("Mira", "Bodmin", m.Stamp.SECOND).message, "")


def equal_cards(ctx):
    m = records(ctx)
    a = m.Postcard("Vance", "Exeter", m.Stamp.SECOND, "Returned, overdue")
    b = m.Postcard("Vance", "Exeter", m.Stamp.SECOND, "Returned, overdue")
    c = m.Postcard("Vance", "Exeter", m.Stamp.FIRST, "Returned, overdue")
    same("Two identical cards are equal", a == b, True)
    same("A different stamp makes a different card", a == c, False)


def redirected(ctx):
    m = records(ctx)
    card = m.Postcard("Ferro", "Truro", m.Stamp.FIRST, "Fair winds")
    moved = m.redirect(card, "Penzance")
    if not isinstance(moved, m.Postcard) or moved is card:
        raise CheckFailed("redirect should return a new Postcard.")
    same("The redirected card goes to", moved.to, "Penzance")
    same("The original still goes to", card.to, "Truro")
    same("Everything else stays the same", (moved.sender, moved.stamp, moved.message), ("Ferro", m.Stamp.FIRST, "Fair winds"))


def empty_bag(ctx):
    m = records(ctx)
    same("Postage for no postcards at all", m.total_postage([]), 0)


def another_bag(ctx):
    m = records(ctx)
    cards = [
        m.Postcard("Okonjo", "Leeds", m.Stamp.SECOND),
        m.Postcard("Sanjay", "Delhi", m.Stamp.ABROAD),
        m.Postcard("Agnes", "Falmouth", m.Stamp.SECOND),
    ]
    same("Postage for two second-class and one abroad", m.total_postage(cards), 390)


def hinted(tree, source):
    for node in tree.body:
        if isinstance(node, _ast.FunctionDef) and node.name in ("total_postage", "redirect"):
            args = node.args.args
            if node.returns is None or any(a.annotation is None for a in args):
                return f"Give {node.name} type hints: one for each argument, and -> for what it returns."


def is_dataclass(ctx):
    m = records(ctx)
    import dataclasses
    if not dataclasses.is_dataclass(m.Postcard):
        raise CheckFailed("Postcard should be a dataclass: put @dataclass(frozen=True) on the line above it.")


TESTS = [
    custom("Bea's postcard", beas_card, visible=True),
    custom("Today's bag", todays_bag, visible=True),
    custom("Three kinds of stamp", three_stamps,
           hint="class Stamp(Enum), with FIRST = 135, SECOND = 85 and ABROAD = 220 inside."),
    custom("Postcard is a dataclass", is_dataclass,
           hint="Put @dataclass(frozen=True) on the line above class Postcard."),
    custom("A posted card can't be changed", frozen,
           hint="If only this fails, pass frozen=True to @dataclass."),
    custom("A card without a message", default_message,
           hint="message needs a default: message: str = \"\". Fields with defaults go last."),
    custom("Identical cards are equal", equal_cards,
           hint="A dataclass writes __eq__ for you. If this fails, check Postcard is a dataclass and doesn't write its own."),
    custom("Redirecting makes a new card", redirected,
           hint="replace(card, to=town) makes the new card and leaves the old one alone."),
    custom("An empty bag", empty_bag,
           hint="If only this fails, start the total at 0 so an empty list gives 0."),
    custom("Another bag", another_bag,
           hint="Add up every card's postage, whatever the mix of stamps."),
    structure("The functions have type hints", check=hinted,
              hint="Hint every argument and the return value, like def redirect(card: Postcard, town: str) -> Postcard."),
]
